'use-strict'

const Hls = require('hls.js')
const AnimeSaturn = require('../providers/animesaturn')

module.exports = class Video {
    constructor() {
        this.cons = new AnimeSaturn()

        this.videoElement = document.getElementById('video')
        this.videoSource = this.videoElement.src
        this.videoTitle = document.getElementById('video-title')
        this.videoEpisode = document.getElementById('video-episode')
    }

    async displayVideo(episode) {
        const title = document.getElementById('page-anime-title').innerHTML
        var videoSource = await this.getVideoSource(title, episode)
        videoSource = this.toHD(videoSource)

        /* const animeNames = [animeEntry.title.romaji.toLowerCase().replace(/\s/g, '')]
                           .concat(Object.values(animeEntry.synonyms)) */

        this.videoTitle.innerHTML = title
        this.videoEpisode.innerHTML = ('Episode ' + episode)

        this.putSource(videoSource)
        this.fullscreenAndPlay(this.videoElement)
    }

    async getVideoSource(title, episode) {
        return await this.cons.getEpisodeUrl(title, episode)
    }

    async nextEpisode() {
        if(this.episodeElementAdd() == -1) {
            console.warn('This is the last episode, You can\'t go any further!')
            return
        }

        var videoSource = await this.getVideoSource(this.videoTitle.innerHTML,
                                                    this.getEpisodeIdFromTitle())
        videoSource = this.toHD(videoSource)

        this.putSource(videoSource)
        this.videoElement.play()
    }

    async previousEpisode() {
        if(this.episodeElementSubstract() == -1) {
            console.warn('This is the first episode, You can\'t go back any further!')
            return
        }

        var videoSource = await this.getVideoSource(this.videoTitle.innerHTML,
                                                    this.getEpisodeIdFromTitle())
        videoSource = this.toHD(videoSource)

        this.putSource(videoSource)
        this.videoElement.play()
    }

    // temporary HD m3u8 file porter until Consumet API isn't upddated
    toHD(videoSource) {
        return videoSource.slice(0, -13) + '720p/playlist_720p.m3u8'
    }

    episodeElementAdd() {
        const episodes = parseInt(document.getElementById('page-anime-episodes').innerHTML)
        
        if(this.getEpisodeIdFromTitle() !== episodes) {
            this.videoEpisode.innerHTML = this.videoEpisode.innerHTML.slice(0, 8) + parseInt(this.getEpisodeIdFromTitle() + 1)
        } else {
            return -1
        }
    }
    
    episodeElementSubstract() {
        if (this.getEpisodeIdFromTitle() !== 1) {
            this.videoEpisode.innerHTML = this.videoEpisode.innerHTML.slice(0, 8) + parseInt(this.getEpisodeIdFromTitle() - 1)
        } else {
            return -1
        }
    }

    getEpisodeIdFromTitle() {
        return parseInt(this.videoEpisode.innerHTML.slice(8))
    }

    // given the m3u8 file source, play the video and put fullscreen
    putSource(videoSource) {
        if(Hls.isSupported()) {
            var hls = new Hls()

            hls.loadSource(videoSource)
            hls.attachMedia(this.videoElement)
        } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            this.videoElement.src = videoSource
            /* this.videoElement.addEventListener('loadedmetadata',function() {
                this.fullscreenAndPlay(this.videoElement)
            }) */
        }
    }

    // put fullscreen and change the icon
    fullscreenAndPlay(video) {
        const container = document.querySelector(".container")
        const fullScreenBtn = container.querySelector(".fullscreen i")

        // toggle video fullscreen
        container.classList.toggle("fullscreen");
        if(document.fullscreenElement) {
            fullScreenBtn.classList.replace("fa-compress", "fa-expand");
            return document.exitFullscreen();
        }
        fullScreenBtn.classList.replace("fa-expand", "fa-compress");
        container.requestFullscreen();

        // show and play video
        container.style.display = 'block'
        video.play()
    }
}