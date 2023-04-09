import * as popover_menus from "./popover_menus";
import {get_count} from "./starred_messages_data";
import * as top_left_corner from "./top_left_corner";
import {user_settings} from "./user_settings";

export function rerender_ui() {
    let count = get_count();

    if (!user_settings.starred_message_counts) {
        // This essentially hides the count
        count = 0;
    }

    popover_menus.get_topic_menu_popover()?.hide();
    popover_menus.get_starred_messages_popover()?.hide();
    top_left_corner.update_starred_count(count);
}
