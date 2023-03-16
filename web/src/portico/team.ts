import $ from "jquery";
import _ from "lodash";

import * as blueslip from "../blueslip";

const repository_name = [
    "zulip",
    "zulip-desktop",
    "zulip-mobile",
    "python-zulip-api",
    "zulip-js",
    "zulipbot",
    "zulip-terminal",
    "zulip-ios-legacy",
    "zulip-android",
] as const;
type RepositoryNameType = typeof repository_name[number];

export type Contributor = {
    avatar: string;
    email: string;
    github_username?: string;
    name: string;
} & {
    [K in RepositoryNameType]: number;
};

const repo_name_to_tab_name: Record<RepositoryNameType, string> = {
    zulip: "server",
    "zulip-desktop": "desktop",
    "zulip-mobile": "mobile",
    "python-zulip-api": "python-zulip-api",
    "zulip-js": "zulip-js",
    zulipbot: "zulipbot",
    "zulip-terminal": "terminal",
    "zulip-ios-legacy": "",
    "zulip-android": "",
};

// Remember the loaded repositories so that HTML is not redundantly edited
// if a user leaves and then revisits the same tab.
const loaded_repos: string[] = [];

function calculate_total_commits(contributor: Contributor): number {
    let commits = 0;
    for (const repo_name of repository_name) {
        commits += contributor[repo_name];
    }
    return commits;
}

function get_profile_url(contributor: Contributor): string | undefined {
    const commit_email_linked_to_github = "github_username" in contributor;

    if (commit_email_linked_to_github) {
        if (contributor.github_username) {
            return `https://github.com/${contributor.github_username}`;
        }
        blueslip.error("Contributor's github username is undefined.");
    }

    const email = contributor.email;

    for (const repo_name in repo_name_to_tab_name) {
        if (repo_name in contributor) {
            return `https://github.com/zulip/${repo_name}/commits?author=${email}`;
        }
    }

    return undefined;
}

function get_display_name(contributor: Contributor): string {
    if (contributor.github_username) {
        return "@" + contributor.github_username;
    }
    return contributor.name;
}

function exclude_bot_contributors(contributor: Contributor): boolean {
    return contributor.github_username !== "dependabot[bot]";
}

// TODO (for v2 of /team contributors):
//   - Make tab header responsive.
//   - Display full name instead of GitHub username.
export default function render_tabs(contributors: Contributor[]): void {
    const template = _.template($("#contributors-template").html());
    const count_template = _.template($("#count-template").html());
    const total_count_template = _.template($("#total-count-template").html());
    const contributors_list = contributors
        ? contributors.filter((c) => exclude_bot_contributors(c))
        : [];
    const mapped_contributors_list = contributors_list.map((c) => ({
        name: get_display_name(c),
        github_username: c.github_username,
        avatar: c.avatar,
        profile_url: get_profile_url(c),
        commits: calculate_total_commits(c),
    }));
    const total_tab_html = mapped_contributors_list
        .sort((a, b) => (a.commits < b.commits ? 1 : a.commits > b.commits ? -1 : 0))
        .map((c) => template(c))
        .join("");

    const hundred_plus_total_contributors = mapped_contributors_list.filter(
        (c) => c.commits >= 100,
    );

    $("#tab-total .contributors-grid").html(total_tab_html);
    $("#tab-total").prepend(
        total_count_template({
            contributor_count: contributors_list.length,
            tab_name: "total",
            hundred_plus_contributor_count: hundred_plus_total_contributors.length,
        }),
    );

    for (const repo_name of repository_name) {
        const tab_name = repo_name_to_tab_name[repo_name];
        if (!tab_name) {
            continue;
        }
        // Set as the loading template for now, and load when clicked.
        $(`#tab-${CSS.escape(tab_name)} .contributors-grid`).html($("#loading-template").html());

        $(`#${CSS.escape(tab_name)}`).on("click", () => {
            if (!loaded_repos.includes(repo_name)) {
                const filtered_by_repo = contributors_list.filter((c) => c[repo_name]);
                const html = filtered_by_repo
                    .sort((a, b) =>
                        a[repo_name] < b[repo_name] ? 1 : a[repo_name] > b[repo_name] ? -1 : 0,
                    )
                    .map((c) =>
                        template({
                            name: get_display_name(c),
                            github_username: c.github_username,
                            avatar: c.avatar,
                            profile_url: get_profile_url(c),
                            commits: c[repo_name],
                        }),
                    )
                    .join("");

                $(`#tab-${CSS.escape(tab_name)} .contributors-grid`).html(html);
                const contributor_count = filtered_by_repo.length;
                const hundred_plus_contributor_count = filtered_by_repo.filter(
                    (c) => c[repo_name] >= 100,
                ).length;
                const repo_url = `https://github.com/zulip/${repo_name}`;
                $(`#tab-${CSS.escape(tab_name)}`).prepend(
                    count_template({
                        contributor_count,
                        repo_name,
                        repo_url,
                        hundred_plus_contributor_count,
                    }),
                );

                loaded_repos.push(repo_name);
            }
        });
    }
}
