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
            api.play("/videos/demo1/game_over.mp4");
        };

        if (!adRolling && video.index > 0) { // advert should not play on first clip

            var originalVideoIndex = video.index;

            $(root).addClass("ad-active");
            $(root).attr("data-current", originalVideoIndex - 1);
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

                    var index = parseInt($(evt.target).data("index"));
                    console.info("User chose to play " + index);

                    api.video.index = index - 1;
                    finishAndPlayNext(index);
                });
            }).load({
                sources: [
                    { type: "video/mp4",
                        src:  "/videos/ads.mp4" }
                ]
            })/*.disable()*/
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
                                src: "/videos/demo1/game_over.mp4"
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
            console.info("Last video finished");
            //api.setPlaylist([]);
            //TODO : play mission accomplished
        }
    });
});

