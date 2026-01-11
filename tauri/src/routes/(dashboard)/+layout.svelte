<script lang="ts">
  import "../../app.css";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/AppSidebar.svelte";
  import { page } from "$app/state";
  import { currencyManager, initBiFetch } from "@betterinv/lib";
  import { fetchFromServer } from "$lib/fetchFromServer";

  let { children } = $props();
  console.log("history", page.data.history);
  initBiFetch(fetchFromServer);

  currencyManager.currency = page.data.preferences?.currency ?? "USD";
  currencyManager.rates = page.data.rates;
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="w-full p-4 box-border">
    <Sidebar.Trigger
      class="sticky -ml-4 top-4 mb-2 z-50 size-10 md:hidden"
      variant="secondary"
    ></Sidebar.Trigger>
    {@render children?.()}
  </Sidebar.Inset>
</Sidebar.Provider>
