"""Run with Python, matplotlib, Pillow, and LSA_CJK_FONT set to NotoSansCJKsc-Regular.otf."""
from plates import comparison, loops, neighborhood
from study import overview, crops, raw, protocol
from results import results

if __name__ == "__main__":
    for draw in (comparison, loops, neighborhood, overview, crops, raw, protocol, results):
        for chinese in (False, True):
            for mobile in (False, True):
                draw(chinese, mobile)
