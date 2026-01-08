<script lang="ts">
    let { children } = $props();
</script>

<div class="flex flex-wrap gap-2 justify-center p-2">
    {@render children?.()}
</div>
