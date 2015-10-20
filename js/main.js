flowplayer(function(api, root) {
    var adRolling = false;

    api.on("load", function(ev, api, video) {
        if (!adRolling && video.index > 0) { // advert should not play on first clip

            var originalVideoIndex = video.index;

            var finishAndPlay = function(next) {
                $(root).removeClass("ad-active");
                $(".fp-fullscreen", root).show();
                api.disable(false)
                    .off("progress.ad")
                    .play(next);

                adRolling = false;
            };

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
            }).load({
                sources: [
                    { type: "video/mp4",
                        //src: "https://dl.dropboxusercontent.com/u/7783459/eugene.m4v" }
                        src:  "/videos/ads.mp4" }
                ]
            })/*.disable()*/
            // custom event progress.ad
            .on("progress.ad", function(e, api, currentTime) {
                $(".fp-playlist p", root).text("Make your choice in: " +
                    Math.round(api.video.duration - currentTime) + " seconds");
            }).one("finish", function() {
                finishAndPlay(originalVideoIndex);
            });

            $(".fp-playlist a", root).one("click", function(evt) {
                //evt.preventDefault();
                //evt.stopPropagation();

                var index = parseInt($(evt.target).data("index"));
                console.info("User chose to play " + index);

                api.video.index = index - 1;
                finishAndPlay(index);
            });
        }
    });
});

