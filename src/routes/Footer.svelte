<script>
  import {version} from "$app/environment"
</script>

<footer>
  <ul>
    <li>
      <a href={HOMEPAGE_URL} rel="noreferrer" target="_blank"><span class="icon">commit</span> v{version}</a>
    </li>
    <li>
      <a href={BUGS_URL} rel="noreferrer" target="_blank"
        ><span class="icon">bug_report</span> File an issue</a
      >
    </li>
  </ul>
</footer>

<style>
  footer {
    position: absolute;
    bottom: 0;
    left: 0;
  }

  ul {
    display: flex;
    gap: 16px;
    list-style: none;
  }

  a {
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    text-decoration: none;
  }

  .icon {
    font-size: 16px;
  }
</style>
