# Chords

A mobile-first way to hear how a chord sounds. Pick a root, tap a color, and a sampled instrument plays it.

Major chords scroll forever on the left, and a tap plays only that root. Color variations for the current root, including minor, sit in a vertical list on the right. Switch the bass note, octave, and whether the notes arrive together or one by one.

Playback uses [smplr](https://github.com/danigb/smplr) General MIDI soundfonts (piano, electric piano, nylon guitar). The first tap downloads the instrument.

```bash
npm install
npm run dev
```
