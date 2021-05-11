# gbaldraw-music-player

features:

- playlist player: plays playlist of files and writes its filename to a label file
- tracklist extraction: if there is a .tracklist file next to the playlist item it will look up the track and write that to the label file instead

example of a compatible tracklist format:

```
00:00:00,First
00:03:00,Second
```

## caveats

node-mpv v2 was not on npm, clone and link.
