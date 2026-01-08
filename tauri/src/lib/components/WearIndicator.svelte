<script lang="ts">
    const { wear } = $props();
</script>

<div class="w-full h-3 flex relative py-0.5 box-border">
    <div class="bg-green-800 w-[7%] h-full rounded-l-xl"></div>
    <div class="bg-green-400 w-[8%] h-full"></div>
    <div class="bg-yellow-400 w-[23%] h-full"></div>
    <div class="bg-orange-400 w-[7%] h-full"></div>
    <div class="bg-red-400 w-[55%] h-full rounded-r-xl"></div>
    <div
        class="w-[3px] h-[100%] absolute top-[0%] bg-amber-100 rounded-4xl"
        style:left={`calc(${wear * 100}% - 1px)`}
    ></div>
</div>
<div class="text-center">{wear.toFixed(6)}</div>
