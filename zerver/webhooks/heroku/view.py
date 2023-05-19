from django.http import HttpRequest, HttpResponse

from zerver.decorator import webhook_view
from zerver.lib.exceptions import UnsupportedWebhookEventTypeError
from zerver.lib.request import REQ, has_request_variables
from zerver.lib.response import json_success
from zerver.lib.validator import WildValue, check_string, to_wild_value
from zerver.lib.webhooks.common import check_send_webhook_message
from zerver.models import UserProfile

RELEASE_STARTED_MESSAGE_TEMPLATE = """
The release has started for {app_name} by {user_email}.
""".strip()

RELEASE_PHASE_FINISHED_MESSAGE_TEMPLATE = """
The Release phase (db migrations, etc.) has finished for {app_name} by {user_email}.
""".strip()

RELEASE_FINISHED_MESSAGE_TEMPLATE = """
The Release has finished for {app_name} by {user_email} and the code is live.
""".strip()


def get_template(payload: WildValue) -> str:
    resource = payload["resource"].tame(check_string)
    action = payload["action"].tame(check_string)
    status = payload["data"]["status"].tame(check_string)
    app_name = payload["data"]["app"]["name"].tame(check_string)
    user_email = payload["data"]["user"]["email"].tame(check_string)

    if resource == "release":
        if action == "create" and status == "pending" and "current" not in payload["data"]:
            return RELEASE_STARTED_MESSAGE_TEMPLATE.format(
                app_name=app_name,
                user_email=user_email,
            )
        if action == "update" and status == "succeeded":
            if "current" in payload["data"]:
                return RELEASE_FINISHED_MESSAGE_TEMPLATE.format(
                    app_name=app_name,
                    user_email=user_email,
                )
            else:
                return RELEASE_PHASE_FINISHED_MESSAGE_TEMPLATE.format(
                    app_name=app_name,
                    user_email=user_email,
                )
    raise UnsupportedWebhookEventTypeError("Not supported webhook type.")


@webhook_view("Heroku")
@has_request_variables
def api_heroku_webhook(
    request: HttpRequest,
    user_profile: UserProfile,
    payload: WildValue = REQ(argument_type="body", converter=to_wild_value),
) -> HttpResponse:
    # construct the body of the message
    body = get_template(payload)

    topic = payload["data"]["app"]["name"].tame(check_string)

    # send the message
    check_send_webhook_message(request, user_profile, topic, body)

    return json_success(request)
