/*
    ioBroker.vis players-widgets Widget-Set

    version: "0.1.0"

    Copyright 10.2015-2016 instalator<vvvalt@mail.ru>

*/
"use strict";

// add translations for edit mode
if (vis.editMode) {
    $.extend(true, systemDictionary, {
        "myColor":          {"en": "myColor",       "de": "Hauptfarbe",  "ru": "Мой цвет"},
        "myColor_tooltip":  {
            "en": "Description of\x0AmyColor",
            "de": "Beschreibung von\x0AHauptfarbe",
            "ru": "Описание\x0AmyColor"
        },
        "htmlText":         {"en": "htmlText",      "de": "htmlText",   "ru": "htmlText"},
        "group_extraMyset": {"en": "extraMyset",    "de": "extraMyset", "ru": "extraMyset"},
        "extraAttr":        {"en": "extraAttr",     "de": "extraAttr",  "ru": "extraAttr"},
        "oid_play":         {"en": "Play",          "de": "Play",       "ru": "Play"},
        "oid_next":         {"en": "Next",          "de": "Next",       "ru": "Следующий"},
        "oid_prev":         {"en": "Previous",      "de": "Previous",   "ru": "Предыдущий"},
        "oid_stop":         {"en": "Stop",          "de": "Stop",       "ru": "Стоп"},
        "oid_pause":        {"en": "Pause",         "de": "Pause",      "ru": "Пауза"},
        "oid_seek":         {"en": "Seek",          "de": "Seek",       "ru": "Поиск"},
        "oid_vol":          {"en": "Volume",        "de": "Lautsärke",  "ru": "Громкость"},
        "oid_mute":         {"en": "Mute",          "de": "Mute",       "ru": "Mute"},
        "oid_shuffle":      {"en": "Shuffle",       "de": "Shuffle",    "ru": "shuffle"},
        "oid_repeat":       {"en": "Repeat",        "de": "Repeat",     "ru": "Повтор"},
        "oid_artist":       {"en": "Artist",        "de": "Artist",     "ru": "Исполнитель"},
        "oid_title":        {"en": "Title",         "de": "Titel",      "ru": "Название"},
        "oid_album":      {"en": "Album",         "de": "Album",      "ru": "Альбом"},
        "oid_bitrate":    {"en": "Bitrate",       "de": "Bitrate",    "ru": "Битрейт"},
        "oid_playlist":   {"en": "Playlist",      "de": "Playlist",   "ru": "Плейлист"},
        "oid_playid":     {"en": "Play id",       "de": "Play id",    "ru": "Play id"},
        "oid_cover":      {"en": "Cover URL",     "de": "Bild URL",   "ru": "URL обложки"},
        "oid_next_title": {"en": "Next title",    "de": "Nächster Titel", "ru": "Следующий"},
        "oid_track":      {"en": "Current playing id", "de": "Current playing id", "ru": "Current playing id"},
        "oid_state":      {"en": "Player state",  "de": "Playerzustand", "ru": "Состояние плеера"},
        "text_next":      {"en": "Text 'Next'",   "de": "Text 'Nächstes'", "ru": "Текст 'Следующий'"}
    });
}

// add translations for non-edit mode
$.extend(true, systemDictionary, {
    "Instance":  {"en": "Instance",     "de": "Instanz",     "ru": "Инстанция"},
    "Next:":     {"en": "Next:",        "de": "Nächstes:",   "ru": "Следующая:"}
});

// this code can be placed directly in players.html
vis.binds.players = {
    version: "0.1.0",
    showVersion: function () {
        if (vis.binds.players.version) {
            console.log('Version players: ' + vis.binds.players.version);
            vis.binds.players.version = null;
        }
    },
    states: {
        oid_play:       {val: undefined, role: 'button.play',        winamp: true,  sonos: true},
        oid_state:      {val: undefined, role: 'media.state',        winamp: false, sonos: true},
        oid_next:       {val: undefined, role: 'button.next',        winamp: true,  sonos: true},
        oid_prev:       {val: undefined, role: 'button.prev',        winamp: true,  sonos: true},
        oid_stop:       {val: undefined, role: 'button.stop',        winamp: true},
        oid_cover:      {val: '',        role: 'media.cover',        winamp: false, sonos: true},
        oid_pause:      {val: undefined, role: 'button.pause',       winamp: true,  sonos: true},
        oid_seek:       {val: 0,         role: 'media.seek',         winamp: true},
        oid_vol:        {val: 0,         role: 'level.volume',       winamp: true,  sonos: true},
        oid_mute:       {val: undefined, role: 'media.mute',         winamp: true},
        oid_shuffle:    {val: undefined, role: 'media.mode.shuffle', winamp: true},
        oid_repeat:     {val: undefined, role: 'media.mode.repeat',  winamp: true},
        oid_artist:     {val: '',        role: 'media.artist',       winamp: true,  sonos: true},
        oid_title:      {val: '',        role: 'media.title',        winamp: true,  sonos: true},
        oid_next_title: {val: '',        role: 'media.title.next',   winamp: false, sonos: true},
        oid_album:      {val: '',        role: 'media.album',        winamp: true,  sonos: true},
        oid_bitrate:    {val: '',        role: 'media.bitrate',      winamp: true},
        oid_playlist:   {val: '',        role: 'media.playlist',     winamp: true},
        oid_playid:     {val: '',        role: 'media.playid',       winamp: true},
        oid_track:      {val: '',        role: 'media.track',        winamp: true},
        oid_browser:    {val: '',        role: 'media.browser',      winamp: true},
        oid_add:        {val: '',        role: 'media.add',          winamp: true},
        oid_clear:      {val: '',        role: 'media.clear',        winamp: true}
    },
    
    createWidgetWinampPlayer: function (widgetID, view, data, style) { //tplWinampPlayer
        var $div       = $('#' + widgetID);
        var volSlider  = $div.find('.winamp-vol-slider');
        var seekSlider = $div.find('.winamp-seek-slider');
        var states     = {};

        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.players.createWidgetWinampPlayer(widgetID, view, data, style);
            }, 100);
        }

        // optimize memory, so the whole data object can be cleaned by garbage collector
        var oid_vol = data.oid_vol;

        if (oid_vol) {
            volSlider.slider({
                range: 'min',
                min:    0,
                max:    100,
                value:  0,
                slide: function (event, ui) {
                    vis.setValue(oid_vol, ui.value);
                }
            });
        } else {
            volSlider.hide();
        }

        // optimize memory, so the whole data object can be cleaned by garbage collector
        var oid_seek = data.oid_seek;
        if (oid_seek) {
            seekSlider.slider({
                range: 'min',
                min:    0,
                max:    100,
                value:  0,//states.oid_seek.val,
                slide:  function (event, ui) {
                    vis.setValue(oid_seek, parseInt(ui.value, 10));
                }
            });
        } else {
            seekSlider.hide();
        }

        function updateStates() {
            var $div        = $('#' + widgetID);
            var volSlider  = $div.find('.winamp-vol-slider');
            var seekSlider = $div.find('.winamp-seek-slider');

            states = JSON.parse(JSON.stringify(vis.binds.players.states));

            for (var s in states) {
                if (states.hasOwnProperty(s) && states[s].winamp && data[s] && data[s] !== 'nothing_selected') {
                    states[s].val = vis.states[data[s] + '.val'];
                }
            }

            // make it universal and if user do not defined artist => do not show it
            if (data.oid_artist) {
                $div.find('.winamp-artist').text('Artist: ' + states.oid_artist.val);
            } else {
                $div.find('.winamp-artist').hide();
            }

            if (data.oid_title) {
                $div.find('.winamp-title').text('Title: ' + states.oid_title.val);
            } else {
                $div.find('.winamp-title').hide();
            }

            if (data.oid_album) {
                $div.find('.winamp-album').text('Album: ' + states.oid_album.val);
            } else {
                $div.find('.winamp-album').hide();
            }

            if (data.oid_bitrate) {
                $div.find('.winamp-bitrate').text('kbps: ' + states.oid_bitrate.val);
            } else {
                $div.find('.winamp-bitrate').hide();
            }

            if (states.oid_repeat.val) {
                $div.find('.winamp-repeat').show();
            } else {
                $div.find('.winamp-repeat').hide();
            }

            if (states.oid_shuffle.val) {
                $div.find('.winamp-shuffle').show();
            } else {
                $div.find('.winamp-shuffle').hide();
            }

            if (volSlider.hasClass('ui-slider')) {
                volSlider.slider('value', states.oid_vol.val);
            }

            if (seekSlider.hasClass('ui-slider')) {
                seekSlider.slider('value', parseInt(states.oid_seek.val, 10));
            }
        }

        $div.find('.winamp-btn').on('click', function (e) {
            console.log($(e.target).data('id'));
            switch ($(e.target).data('id')) {
                case 'mute':
                    toggle('mute');
                    break;
                case 'play':
                    vis.setValue(data.oid_play, true);
                    break;
                case 'next':
                    vis.setValue(data.oid_next, true);
                    break;
                case 'prev':
                    vis.setValue(data.oid_prev, true);
                    break;
                case 'stop':
                    vis.setValue(data.oid_stop, true);
                    break;
                case 'pause':
                    toggle('pause');
                    break;
                case 'shuffle':
                    toggle('shuffle');
                    break;
                case 'repeat':
                    toggle('repeat');
                    break;
                case 'playlist':
                    $('.win-plst-head').parent().slideToggle('slow', function() {});
                    break;
                case 'library':
                    $('.win-browser-head').parent().slideToggle('slow', function() {});
                    break;
                default:
                    break;
            }
        });

        function toggle(btn) {
            var oid   = 'oid_' + btn;
            var val   = states[oid].val;
            var state = data['oid_' + btn];

            console.log('Press button - ' + btn + ' / val=' + val + ' /state=' + state);

            if (val === 0 || val === '0' || val === false || val === 'false' || val === 'off' || val === undefined) {
                vis.setValue(state, true);
            } else if (val === 1 || val === '1' || val === true || val === 'true' || val === 'on') {
                vis.setValue(state, false);
            }
        }

        // subscribe on updates of values
        var bound = [];
        for (var s in vis.binds.players.states) {
            if (!data[s] || data[s] === 'nothing_selected' || !vis.binds.players.states[s].winamp) continue;

            bound.push(data[s] + '.val');
            vis.states.bind(data[s] + '.val', updateStates);
        }

        if (bound.length) {
            // remember all ids, that bound
            $div.data('bound', bound);
            // remember bind handler
            $div.data('bindHandler', updateStates);
        }
        // initial update
        updateStates();

        // destroy sliders
        $div.data('destroy', function (id) {
            var $div       = $('#' + id);
            var volSlider  = $div.find('.winamp-vol-slider');
            var seekSlider = $div.find('.winamp-seek-slider');
            if (volSlider.hasClass('ui-slider')) volSlider.slider('destroy');
            if (seekSlider.hasClass('ui-slider')) seekSlider.slider('destroy');
        });
    },

    createWidgetWinampPlaylist: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        var playlist;
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.players.createWidgetWinampPlaylist(widgetID, view, data, style);
            }, 100);
        }

        function updateStates(e, pl){
            var $div = $('#' + widgetID);
            try {
                playlist = JSON.parse(pl);
            } catch (e) {
            }
            $div.find('.winamp-playlist-container').empty();
            if (playlist){
                playlist.forEach(function (item, i, plst){
                    var obj = playlist[i];
                    var text = ' ';
                    if (obj.file){
                        text = obj.file.split('/');
                        text = text[text.length - 1];
                    }
                    $div.find('.winamp-playlist-container').append('<li class="item' + (i + 1) + '">' + ( i + 1) + ' - ' + text + '</li>');
                });
            }

            $div.find('.winamp-playlist-container').on('click', 'li', function(){
                var n = $(this).index();
                vis.setValue(data.oid_playid, n);
            });
        }

        function updatePosition(e, newVal, oldVal) {
            var $div = $('#' + widgetID);
            $div.find('.winamp-playlist-container').children().removeClass('active');
            var id = parseInt(newVal) + 1;
            setTimeout(function() {
                $div.find('.winamp-playlist-container .item' + id).addClass('active');
            }, 500);
        }

        if (data.oid_playlist && data.oid_playlist !== 'nothing_selected'){
            playlist = vis.states[data.oid_playlist + '.val'];
            updateStates(null, playlist);
        }

        if (data.oid_track && data.oid_track !== 'nothing_selected'){
            updatePosition(null, vis.states[data.oid_track + '.val']);
        }

        $div.find('.winamp-plst-close').on('click', function (e) {
            $div.slideToggle('slow', function() {});
        });
        $div.find('.win-plst-btn-clear').on('click', function (e) {
            vis.setValue(data.oid_clear, '');
        });

        // subscribe on updates of values
        var bound = [];
        var boundFuncs = [];
        if (data.oid_playlist) {
            bound.push(data.oid_playlist + '.val');
            boundFuncs.push(updateStates);
            vis.states.bind(data.oid_playlist + '.val', updateStates);
        }

        if (data.oid_track) {
            bound.push(data.oid_track + '.val');
            boundFuncs.push(updatePosition);
            vis.states.bind(data.oid_track + '.val', updatePosition);
        }

        if (bound.length) {
            // remember all ids, that bound
            $div.data('bound', bound);
            // remember bind handler
            $div.data('bindHandler', boundFuncs);
        }
    },

    createWidgetWinampBrowser: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        var browser;
        var path = '/';
        var current_path;
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.players.createWidgetWinampBrowser(widgetID, view, data, style);
            }, 100);
        }

        function updateStates(e, pl){
            var $div = $('#' + widgetID);
            var url;
            try {
                browser = JSON.parse(pl);
            } catch (e) {}
            if (browser !== null && typeof browser === 'object'){
                $div.find('.browser-container').empty();
                if(browser.files){
                    browser.files.forEach(function (item, i, plst){
                        var obj = browser.files[i];
                        var text = obj.file;// ' '; //TODO
                        if (obj.file && ~obj.file.indexOf('/')){
                            text = obj.file.split('/');
                            if (text[text.length - 1]){
                                text = text[text.length - 1];
                            } else {
                                text = text[text.length - 2];
                            }
                        } else if (obj.file && ~obj.file.indexOf('\\')){
                            text = obj.file.split('\\');
                            if (text[text.length - 1]){
                                text = text[text.length - 1];
                            } else {
                                text = text[text.length - 2];
                            }
                        }
                        if (obj.filetype === 'directory'){
                            url = 'widgets/players/img/winamp/folder.gif';
                        } else if (obj.filetype === 'file'){
                            url = 'widgets/players/img/winamp/audiofile.gif';
                        }
                        $div.find(".browser-container").append("<li class='item" + (i + 1) + "'><img src='" + url + "' style='width: 16px; height: 16px; vertical-align: middle; margin: 2px;'> " + text + "</li>");
                    });
                }
            }
        }
	    
	 $div.on('click', '.browser-container li', function(){
                var n = $(this).index();
                var folder = browser.files[n].file;
                console.log('click - ' + folder);
                path = getPath(folder);
                current_path = folder;
                vis.setValue(data.oid_browser, folder);
		return;
            });

        if (data.oid_browser && data.oid_browser !== 'nothing_selected'){
            browser = vis.states[data.oid_browser + '.val'];
            updateStates(null, browser);
        }

        $div.find('.winamp-brwsr-close').on('click', function (e) {
            $div.slideToggle('slow', function() {});
        });
        $div.find('.mlItem').on('click', function (e) {
            vis.setValue(data.oid_browser, path);
            current_path = path;
            path = getPath(path);
        });
        $div.find('.browser-btn-add').on('click', function (e) {
            vis.setValue(data.oid_add, current_path);
        });

        function getPath(folders){
            var arr = [];
            var len;
            if (folders && ~folders.indexOf('/')){
                arr = folders.split('/');
                len = arr.length;
                if (!arr[len - 1]){
                    arr.splice((len - 2), 2);
                } else {
                    arr.splice((len - 1), 1);
                }
                console.log('Array - ' + arr); //
                if(arr[0] === 'smb:'){
                    if (arr.length === 3 && isIPv4(arr[2]) || arr.length == 1){
                        arr = [];
                    }
                    if (arr.length == 2){
                        arr[1] = '/';
                    }
                }
                console.log('Array 2 - ' + arr);
                if (arr.length > 0){
                    folders = arr.join('/');
                } else {
                    folders = '/';
                }
            } else if (folders && ~folders.indexOf('\\')){
                arr = folders.split('\\');
                console.log('Array split - ' + arr);
                len = arr.length;
                arr.splice((len - 1), 1);

                console.log('Array 3 - ' + arr);
                len = arr.length;
                if(arr[0] && ~arr[0].indexOf(':')){
                    arr.splice((len - 1), 1);
                    arr[arr.length-1] += '\\';
                }
                console.log('Array 4 - ' + arr);
                if (arr.length > 0){
                    folders = arr.join('\\');
                } else {
                    folders = '/';
                }
            } else {
                folders = '/';
            }
            console.log('folders - ' + folders);
            return folders;
        }

        function isIPv4(addr) {
            return /^(([01]?\d{1,2}|2[0-4]\d|25[0-5])(\.|$)){4}$/.test(addr);
        }

        // subscribe on updates of values
        var bound = [];
        if (data.oid_browser) {
            bound.push(data.oid_browser + '.val');
            vis.states.bind(data.oid_browser + '.val', updateStates);
        }
        if (bound.length) {
            // remember all ids, that bound
            $div.data('bound', bound);
        }
    },

    createWidgetSonosPlayer: function (widgetID, view, data, style) { //tplSonosMobilePlayer
        var $div       = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds.players.createWidgetSonosPlayer(widgetID, view, data, style);
            }, 100);
        }
        // translate
        $div.find('.sonos-next-track-title').html(data.text_next || _('Next:'));

        if ($div.width() < $div.height()) {
            $div.removeClass('sonos-landscape').addClass('sonos-portrait');
        }

        var oid_vol = data.oid_vol;

        if (oid_vol) {
            $div.find('.sonos-master-volume').slider({
                range: 'min',
                min:   0,
                max:   100,
                value: 0,
                slide: function (event, ui) {
                    vis.setValue($(this).data('id'), ui.value);
                }
            }).data('id', oid_vol);
        } else {
            $div.find('.sonos-master-volume').hide();
        }

        if (!data.oid_play && !data.oid_pause) $div.find('.sonos-play-pause').hide();

        if (!data.oid_prev) $div.find('.sonos-prev').hide();

        if (!data.oid_next) $div.find('.sonos-next').hide();

        $div.find('.sonos-button').on('click', function (e) {
            switch ($(this).data('control')) {
                case 'mute':
                    //toggle('mute');
                    break;
                case 'play':
                    vis.setValue(data.oid_play, true);
                    break;
                case 'next':
                    vis.setValue(data.oid_next, true);
                    break;
                case 'prev':
                    vis.setValue(data.oid_prev, true);
                    break;
                case 'stop':
                    vis.setValue(data.oid_stop, true);
                    break;
                case 'pause':
                    vis.setValue(data.oid_pause, true);
                    break;
                case 'shuffle':
                    //toggle('shuffle');
                    break;
                case 'repeat':
                    //toggle('repeat');
                    break;
                default:
                    break;
            }
        });

        function updateStates() {
            var $div = $('#' + widgetID);
            var $volSlider = $div.find('.sonos-master-volume');

            var states = JSON.parse(JSON.stringify(vis.binds.players.states));

            for (var s in states) {
                if (states.hasOwnProperty(s) && states[s].sonos && data[s] && data[s] !== 'nothing_selected') {
                    states[s].val = vis.states[data[s] + '.val'];
                }
            }
            if (data.oid_state) {
                if (states.oid_state.val === 'play' || states.oid_state.val === 'playing' || states.oid_state.val === true || states.oid_state.val === 'true') {
                    $div.find('.sonos-button[data-control="play"]').hide();
                    $div.find('.sonos-button[data-control="pause"]').show();
                } else  {
                    $div.find('.sonos-button[data-control="play"]').show();
                    $div.find('.sonos-button[data-control="pause"]').hide();
                }
            }

            // make it universal and if user do not defined artist => do not show it
            if (data.oid_cover) {
                $div.find('.sonos-current-track-art').attr('src', states.oid_cover.val ? states.oid_cover.val + '?' + new Date().getTime() : 'widgets/players/img/sonos/no_cover.jpg');
            } else {
                $div.find('.sonos-current-track-art').attr('src', 'widgets/players/img/sonos/no_cover.jpg');
            }

            if (data.oid_title) {
                $div.find('.sonos-track').text(states.oid_title.val);
            } else {
                $div.find('.sonos-track').hide();
            }

            if (data.oid_album) {
                $div.find('.sonos-album').text(states.oid_album.val);
            } else {
                $div.find('.sonos-album').hide();
            }

            if (data.oid_artist) {
                $div.find('.sonos-artist').text(states.oid_artist.val);
            } else {
                $div.find('.sonos-artist').hide();
            }

            if (data.oid_next_title) {
                $div.find('.sonos-next-track-text').text(states.oid_next_title.val);
            } else {
                $div.find('.sonos-next-track').hide();
            }

            if ($volSlider.hasClass('ui-slider')) {
                $volSlider.slider('value', states.oid_vol.val);
            }
        }

        // subscribe on updates of values
        var bound = [];
        for (var s in vis.binds.players.states) {
            if (!data[s] || data[s] === 'nothing_selected' || !vis.binds.players.states[s].sonos) continue;

            bound.push(data[s] + '.val');
            vis.states.bind(data[s] + '.val', updateStates);
        }

        if (bound.length) {
            // remember all ids, that bound
            $div.data('bound', bound);
            // remember bind handler
            $div.data('bindHandler', updateStates);
        }

        updateStates();

        // destroy sliders
        $div.data('destroy', function (id) {
            var $div       = $('#' + id);
            var $volSlider = $div.find('.sonos-master-volume');
            if ($volSlider.hasClass('ui-slider')) $volSlider.slider('destroy');
        });
    }
};

if (vis.editMode) {
    vis.binds.players.onPlayCommonChanged = function (widgetID, view, newId, attr, isCss, oldValue, type) {
        if (oldValue && oldValue !== 'nothing_selected') return;
        console.log('---------: ' + widgetID +' - ' + view + ' - ' + newId + ' - ' + attr + ' - ' + isCss);

        var changed = [];
        var obj = vis.objects[newId];

        // If it is real object and SETPOINT
        if (obj && obj.common && obj.type === 'state') {
            var roles = [];
            var s;
            for (s in vis.binds.players.states) {
                if (!vis.binds.players.states.hasOwnProperty(s) || !vis.binds.players.states[s][type]) continue;
                if (vis.views[view].widgets[widgetID].data[s]) continue;

                roles.push(vis.binds.players.states[s].role);
            }

            if (roles.length) {
                var result = vis.findByRoles(newId, roles);
                if (result) {
                    var name;
                    for (var r in result) {
                        if (!result.hasOwnProperty(r)) continue;

                        name = null;
                        for (s in vis.binds.players.states) {
                            if (!vis.binds.players.states.hasOwnProperty(s)) continue;

                            if (vis.binds.players.states[s].role === r) {
                                changed.push(s);
                                vis.views[view].widgets[widgetID].data[s] = result[r];
                                vis.widgets[widgetID].data[s] = result[r];
                                break;
                            }
                        }
                    }
                }
            }
        }
        return changed;
    };
    vis.binds.players.onWinampBrowserChanged = function (widgetID, view, newId, attr, isCss, oldValue) {
        return vis.binds.players.onPlayCommonChanged(widgetID, view, newId, attr, isCss, oldValue, 'winamp');
    };
    vis.binds.players.onWinampPlaylistChanged = function (widgetID, view, newId, attr, isCss, oldValue) {
        return vis.binds.players.onPlayCommonChanged(widgetID, view, newId, attr, isCss, oldValue, 'winamp');
    };
    vis.binds.players.onPlayWinampChanged = function (widgetID, view, newId, attr, isCss, oldValue) {
        return vis.binds.players.onPlayCommonChanged(widgetID, view, newId, attr, isCss, oldValue, 'winamp');
    };
    vis.binds.players.onPlaySonosChanged = function (widgetID, view, newId, attr, isCss, oldValue) {
        return vis.binds.players.onPlayCommonChanged(widgetID, view, newId, attr, isCss, oldValue, 'sonos');
    };
}
	
vis.binds.players.showVersion();
