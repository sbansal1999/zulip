#!/usr/bin/env python3
import glob
import os
import shutil
import sys
from typing import List

ZULIP_PATH = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ZULIP_PATH not in sys.path:
    sys.path.append(ZULIP_PATH)
from scripts.lib.setup_path import setup_path

setup_path()

from zulip_bots.lib import get_bots_directory_path


def generate_zulip_bots_static_files() -> None:
    bots_dir = "static/generated/bots"
    if os.path.isdir(bots_dir):
        # delete old static files, they could be outdated
        shutil.rmtree(bots_dir)

    os.makedirs(bots_dir, exist_ok=True)

    def copyfiles(paths: List[str], are_assets: bool = False) -> None:
        for src_path in paths:
            if are_assets:
                bot_name = os.path.basename(os.path.dirname(os.path.dirname(src_path)))
                bot_dir = os.path.join(
                    bots_dir, bot_name, os.path.basename(os.path.dirname(src_path))
                )
            else:
                bot_name = os.path.basename(os.path.dirname(src_path))
                bot_dir = os.path.join(bots_dir, bot_name)

            os.makedirs(bot_dir, exist_ok=True)

            dst_path = os.path.join(bot_dir, os.path.basename(src_path))
            if not os.path.isfile(dst_path):
                shutil.copyfile(src_path, dst_path)

    package_bots_dir = get_bots_directory_path()

    logo_glob_pattern = os.path.join(package_bots_dir, "*/logo.*")
    logos = glob.glob(logo_glob_pattern)
    copyfiles(logos)

    doc_glob_pattern = os.path.join(package_bots_dir, "*/doc.md")
    docs = glob.glob(doc_glob_pattern)
    copyfiles(docs)

    assets_glob_pattern = os.path.join(package_bots_dir, "*/assets/*")
    assets = glob.glob(assets_glob_pattern)
    copyfiles(assets, are_assets=True)


if __name__ == "__main__":
    generate_zulip_bots_static_files()
