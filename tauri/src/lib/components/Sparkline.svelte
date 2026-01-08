<script lang="ts">
    import { genPath } from "./util/genPath";

    const HEIGHT = 20;
    const WIDTH = 100;
    const PADDING = 2;

    const BOTTOM_COLOR = "oklch(57.7% 0.245 27.325)";
    const MIDDLE_COLOR = "oklch(85.2% 0.199 91.936)";
    const TOP_COLOR = "oklch(64.8% 0.2 131.684)";

    const { data, strokeWidth = 2 }: { data: number[]; strokeWidth: number } =
        $props();

    const minValue = Math.min(...data);
    const maxValue = Math.max(...data);

    const computedWidth = WIDTH - PADDING * 2;
    const computedHeight = HEIGHT - PADDING * 2;

    const commands = data.map((value, index) => {
        const relValue = (value - minValue) / (maxValue - minValue);
        const scaledValue = relValue * computedHeight + PADDING;

        const x = index * (computedWidth / (data.length - 1)) + PADDING;

        return {
            x,
            y: HEIGHT - scaledValue,
        };
    });

    const string = genPath(commands, 10, false, HEIGHT);
</script>

<svg
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    xmlns="http://www.w3.org/2000/svg"
    stroke-width={strokeWidth}
>
    <defs
        ><linearGradient
            id="trendline-v-77"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="100%"
            x2="0"
            y2="0"
            ><stop offset="0" stop-color={BOTTOM_COLOR}></stop><stop
                offset="0.3"
                stop-color={MIDDLE_COLOR}
            ></stop><stop offset="0.8" stop-color={TOP_COLOR}
            ></stop></linearGradient
        ></defs
    >
    <path
        stroke-linecap="round"
        d={string}
        fill="none"
        stroke="url(#trendline-v-77)"
        style="stroke-dasharray: 433.901; stroke-dashoffset: 0; transition: stroke-dashoffset 2000ms;"
    ></path>

    <!-- If you do not specify the stroke
       color the line will not be visible -->
</svg>
