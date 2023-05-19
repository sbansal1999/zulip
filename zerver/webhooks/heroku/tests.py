from zerver.lib.test_classes import WebhookTestCase


class HerokuHookTests(WebhookTestCase):
    STREAM_NAME = "heroku"
    URL_TEMPLATE = "/api/v1/external/heroku?&api_key={api_key}&stream={stream}"
    WEBHOOK_DIR_NAME = "heroku"

    def test_build_started_message(self) -> None:
        expected_topic = "trade-it-15-server"
        expected_message = "Build has started for trade-it-15-server by sbansal1999@gmail.com"

        self.check_webhook(
            "build_started", expected_topic, expected_message, content_type="application/json"
        )

    def test_build_finished_message(self) -> None:
        expected_topic = "trade-it-15-server"
        expected_message = "Build has finished for trade-it-15-server by sbansal1999@gmail.com"

        self.check_webhook(
            "build_finished", expected_topic, expected_message, content_type="application/json"
        )

    def test_release_started_message(self) -> None:
        expected_topic = "trade-it-15-server"
        expected_message = (
            "Release has been started for trade-it-15-server by sbansal1999@gmail.com"
        )

        self.check_webhook(
            "release_started", expected_topic, expected_message, content_type="application/json"
        )

    def test_release_phase_finished_message(self) -> None:
        expected_topic = "trade-it-15-server"
        expected_message = "Release has finished for trade-it-15-server by sbansal1999@gmail.com"

        self.check_webhook(
            "release_finished", expected_topic, expected_message, content_type="application/json"
        )
