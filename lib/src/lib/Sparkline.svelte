<script lang="ts">
    import { genPath } from "./util/genPath.js";

    const HEIGHT = 30;
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

    const range = maxValue - minValue;

    // Use the larger magnitude so it also works for negative values
    const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue), 1);
    const relativeRange = range / maxAbs; // e.g. 0.02 = 2% variation

    // When relativeRange >= FLAT_THRESHOLD → normal behavior
    // When relativeRange → 0 → completely flat line
    const FLAT_THRESHOLD = 0.05; // 5% variation
    const flatFactor =
        range === 0
            ? 0 // all values identical → perfectly flat
            : Math.min(1, relativeRange / FLAT_THRESHOLD);

    const commands = data.map((value, index) => {
        // Normal 0..1 mapping based on min/max
        const baseRel = range === 0 ? 0.5 : (value - minValue) / range;

        // Dampen deviation from the middle (0.5) when the series is very flat
        const relValue = 0.5 + (baseRel - 0.5) * flatFactor;

        const scaledValue = relValue * computedHeight + PADDING;
        const x =
            data.length === 1
                ? WIDTH / 2
                : index * (computedWidth / (data.length - 1)) + PADDING;

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
