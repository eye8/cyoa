flowplayer(function(api, root) {
    var adRolling = false;

    api.on("load", function(ev, api, video) {

        var finishAndPlayNext = function() {
            $(root).removeClass("ad-active");
            $(".fp-fullscreen", root).show();

            api.disable(false)
                .off("progress.ad")
                .next();

            adRolling = false;
        };

        var gameover = function() {
            api.play("https://dl.dropboxusercontent.com/u/7783459/cyoa/demo1/game_over.mp4");
        };

        if (!adRolling && video.index > 0) { // advert should not play on first clip

            var originalVideoIndex = video.index;

            $(root).addClass("ad-active");
            $(root).attr("data-current", originalVideoIndex-1);
            // fullscreen button will be inactive while api is disabled
            $(".fp-fullscreen", root).hide();
            ev.preventDefault();
            api.loading = false;

            adRolling = true;

            api.one("load", function() {
                // trick flowplayer to think we are playing the previouse clip
                // so we can resume with originalVideoIndex after the advert
                api.video.index = originalVideoIndex - 1;

                $(".fp-playlist a", root).one("click", function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();

                    var index = parseInt($(evt.target).data("to"));
                    console.info("User chose to play " + index);

                    api.video.index = index - 1;
                    finishAndPlayNext(index);
                });
            }).load({
                sources: [
                    { type: "video/mp4",
                        src:  "https://dl.dropboxusercontent.com/u/7783459/cyoa/ads.mp4" }
                ]
            }).disable()
            // custom event progress.ad
            .on("progress.ad", function(e, api, currentTime) {
                $(".fp-playlist p", root).text("Make your choice in: " +
                    Math.round(api.video.duration - currentTime) + " seconds");
            }).one("finish", function() {
                if(!adRolling) {
                    $(".fp-playlist a", root).off("click");
                    finishAndPlayNext();
                } else {
                    console.info("User did not choose. Play #" + api.video.index);
                    api.setPlaylist([{
                        sources: [
                            {
                                type: "video/mp4",
                                src: "https://dl.dropboxusercontent.com/u/7783459/cyoa/demo1/game_over.mp4"
                            }
                        ]
                    }]);
                    $(".fp-playlist a", root).off("click");
                    api.video.index = 0;
                    finishAndPlayNext();
                }
            });
        }
    }).on("finish", function(ev) {
        if(api.video.is_last) {
            console.info("Mission accomplished");
            api.setPlaylist([{
                sources: [
                    {
                        type: "video/mp4",
                        src: "https://dl.dropboxusercontent.com/u/7783459/cyoa/demo1/23.mp4"
                    }
                ]
            }]);
            $(".fp-playlist a", root).off("click");
            api.video.index = 0;
            finishAndPlayNext();
        }
    });
});

