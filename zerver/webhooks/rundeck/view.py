from django.http import HttpRequest, HttpResponse

from zerver.decorator import webhook_view
from zerver.lib.request import REQ, has_request_variables
from zerver.lib.response import json_success
from zerver.lib.validator import WildValue, check_string, to_wild_value
from zerver.lib.webhooks.common import check_send_webhook_message
from zerver.models import UserProfile

RUNDECK_MESSAGE_TEMPLATE = "Job Execution [{status}]({link}) :{emoji}:"
RUNDECK_TOPIC_TEMPLATE = "{job_name}"


@webhook_view("Rundeck")
@has_request_variables
def api_rundeck_webhook(
    request: HttpRequest,
    user_profile: UserProfile,
    payload: WildValue = REQ(argument_type="body", converter=to_wild_value),
) -> HttpResponse:
    subject = get_topic(payload)
    body = get_body(payload)

    check_send_webhook_message(request, user_profile, subject, body)
    return json_success(request)


def get_topic(payload: WildValue) -> str:
    return RUNDECK_TOPIC_TEMPLATE.format(
        job_name=payload["execution"]["job"]["name"].tame(check_string)
    )


def get_body(payload: WildValue) -> str:
    data = {
        "status": payload["execution"]["status"].tame(check_string).upper(),
        "link": payload["execution"]["href"].tame(check_string),
    }

    if data["status"] == "FAILED":
        data["emoji"] = "cross_mark"

    if data["status"] == "SUCCEEDED":
        data["emoji"] = "check"

    if data["status"] == "RUNNING":
        data["status"] = "RUNNING LONG"
        data["emoji"] = "time_ticking"

    if data["status"] == "SCHEDULED":
        data["status"] = "STARTED"
        data["emoji"] = "running"

    return RUNDECK_MESSAGE_TEMPLATE.format(**data)
