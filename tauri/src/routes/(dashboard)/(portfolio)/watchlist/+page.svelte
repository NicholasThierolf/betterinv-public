<script lang="ts">
    import { WatchPage } from "@betterinv/lib";
    import type { PageProps } from "./$types";

    let { data }: PageProps = $props();
</script>

<WatchPage
    allItems={data.allItems}
    watchedItems={data.dashboard.then((dashboard) => dashboard.watchedItems)}
/>
