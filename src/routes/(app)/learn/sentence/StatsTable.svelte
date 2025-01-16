<script lang="ts">
  let {
    wordStats,
    level,
    masteryThresholds,
  }: { wordStats: object; level: number; masteryThresholds: number[] } =
    $props();

  // Function to calculate average time for a word
  function calculateAverageTime(times: number[]): number {
    if (times.length === 0) return Number.NaN;
    const totalTime = times.reduce((a, b) => a + b, 0);
    return totalTime / times.length;
  }

  // Function to calculate WPM for each timing
  function calculateWPM(elapsedTime: number, wordLength: number): number {
    const minutesElapsed = elapsedTime / 60000;
    return Math.floor(wordLength / minutesElapsed);
  }

  // Function to get the best WPM for a word
  function getBestWPM(times: number[], wordLength: number): number {
    if (times.length === 0) return Number.NaN;
    const wpms = times.map((time) => calculateWPM(time, wordLength));
    return Math.max(...wpms);
  }

  function getLastWPM(times: number[], wordLength: number) {
    const lastTime = times[times.length - 1];
    return lastTime === undefined
      ? Number.NaN
      : calculateWPM(lastTime, wordLength);
  }
</script>

<div class="stats-table">
  <h2>Stats for Level {level}</h2>

  <table>
    <thead>
      <tr>
        <th>Word</th>
        <th>Last WPM</th>
        <!-- Individualized -->
        <th>Best WPM</th>
        <!-- Individualized -->
        <th>Attempts</th>
        <th>Average Time</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(wordStats) as [word, times]}
        <tr>
          <td>{word}</td>
          <td>{getLastWPM(times, word.split(" ").length)}</td>
          <!-- Individualized -->
          <td>{getBestWPM(times, word.split(" ").length)}</td>
          <!-- Individualized -->
          <td>{times.length}</td>
          <td>{calculateAverageTime(times)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .stats-table {
    margin-top: 20px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }

  th,
  td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: left;
  }

  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }
</style>
