Receive notifications in Zulip whenever a new version of an app
is pushed to Heroku using the Zulip Heroku plugin!

1. {!create-stream.md!}

1. {!create-bot-construct-url.md!}

1. Go to the **Dashboard** page for your app and to to the dropdown
   menu below **More**. You will see an option to **View Webhooks** that
   will take you to the webhooks creation and management interface.

1. On this page click on **Create Webhook** and fill out the form
   and set the **Payload URL** to the URL constructed above. Right
   now, we only support **api:build** and **api:release** events.
   After you've filled out the form, click on **Add Webhook**.

{!congrats.md!}

![](/static/images/integrations/heroku/001.png)
