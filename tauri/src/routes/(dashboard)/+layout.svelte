<script lang="ts">
  import "../../app.css";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import AppSidebar from "$lib/components/AppSidebar.svelte";
  import { page } from "$app/state";
  import { initBiFetch } from "@betterinv/lib";
  import { fetchFromServer } from "$lib/fetchFromServer";

  let { children } = $props();
  console.log("history", page.data.history);
  initBiFetch(fetchFromServer);
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset class="w-full p-4 box-border">
    {@render children?.()}
  </Sidebar.Inset>
</Sidebar.Provider>
