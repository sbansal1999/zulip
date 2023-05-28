import type {InputPillContainer, InputPillItem} from "./input_pill";
import * as user_groups from "./user_groups";
import type {UserGroup} from "./user_groups";

type Item = InputPillItem<{id: UserGroup["id"]; group_name: UserGroup["name"]}>;
type PillWidget = InputPillContainer<{id: UserGroup["id"]; group_name: UserGroup["name"]}>;

function display_pill(group: UserGroup): string {
    return `${group.name}: ${group.members.size} users`;
}

export function create_item_from_group_name(
    group_name: UserGroup["name"],
    current_items: Item[],
): Item | undefined {
    group_name = group_name.trim();
    const group = user_groups.get_user_group_from_name(group_name);
    if (!group) {
        return undefined;
    }

    const in_current_items = current_items.find((item) => item.id === group.id);
    if (in_current_items !== undefined) {
        return undefined;
    }

    const item = {
        type: "user_group",
        display_value: display_pill(group),
        id: group.id,
        group_name: group.name,
    };

    return item;
}

export function get_group_name_from_item(item: Item): string {
    return item.group_name;
}

function get_user_ids_from_user_groups(items: Item[]): number[] {
    const group_ids = items.map((item) => item.id).filter(Boolean);
    return group_ids.flatMap((group_id) => [
        ...user_groups.get_user_group_from_id(group_id).members,
    ]);
}

export function get_user_ids(pill_widget: PillWidget): number[] {
    const items = pill_widget.items();
    let user_ids = get_user_ids_from_user_groups(items);
    user_ids = [...new Set(user_ids)];
    user_ids.sort((a, b) => a - b);

    user_ids = user_ids.filter(Boolean);
    return user_ids;
}

export function append_user_group(group: UserGroup, pill_widget: PillWidget): void {
    if (group !== undefined && group !== null) {
        pill_widget.appendValidatedData({
            type: "user_group",
            display_value: display_pill(group),
            id: group.id,
            group_name: "",
        });
        pill_widget.clear_text();
    }
}

export function get_group_ids(pill_widget: PillWidget): number[] {
    const items = pill_widget.items();
    let group_ids = items.map((item) => item.id);
    group_ids = group_ids.filter(Boolean);

    return group_ids;
}

export function filter_taken_groups(groups: UserGroup[], pill_widget: PillWidget): UserGroup[] {
    const taken_group_ids = get_group_ids(pill_widget);
    groups = groups.filter((item) => !taken_group_ids.includes(item.id));
    return groups;
}

export function typeahead_source(pill_widget: PillWidget): UserGroup[] {
    const groups = user_groups.get_realm_user_groups();
    return filter_taken_groups(groups, pill_widget);
}
