<script>
  import {page} from "$app/stores"
</script>

<h1>{$page.status}</h1>
<pre>{$page.error?.message}</pre>
