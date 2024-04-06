// @ts-nocheck
/*******************************
 * HOLD UP AND READ THIS FIRST *
 *******************************
 *
 * Chara devices have a LIMITED number of commits.
 * calling `Chara.commit()` can be a dangerous operation, which is why a confirmation dialog will be shown.
 * Devices are only rated for 10,000-25,000 commits, exceeding that limit may result in premature breakdowns.
 * `Chara.setSetting` or `Chara.setLayoutKey` is not affected by this, they last however only until the next boot.
 *
 * Chord writing is more forgiving, but keep in mind that excessive large-scale writing can still damage the device.
 *
 */

const count = await Chara.getChordCount(); // => 499
const chord = await Chara.getChord(2); // => {actions: [1, 2, 3], phrase: [4, 5, 6]}

const setting = await Chara.getSetting(5); // => 0

// This, for example, would return all chords
const chords = [];
for (let i = 0; i < count; i++) {
  chords.push(await Chara.getChord(i));
}

// You can also print values to the browser console (F12)
console.log("Chords:", chords);

// You can access the actions by ID!
Actions.SPACE; // => {id: "SPACE", code: 32, icon: "space_bar", description: ...}
Actions[32]; // This also works
Actions[0x20]; // Or this!
