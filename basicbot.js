/**
 *Copyright 2015 NulledBot
 *Modifications (including forks) of the code to fit personal needs are allowed only for personal use and should refer back to the original source.
 *This software is not for profit, any extension, or unauthorised person providing this software is not authorised to be in a position of any monetary gain from this use of this software. Any and all money gained under the use of the software (which includes donations) must be passed on to the original author.
 */


(function () {

    /*window.onerror = function() {
        var room = JSON.parse(localStorage.getItem("NulledBotRoom"));
        window.location = 'https://plug.dj' + room.name;
    };*/

    API.getWaitListPosition = function(id){
        if(typeof id === 'undefined' || id === null){
            id = API.getUser().id;
        }
        var wl = API.getWaitList();
        for(var i = 0; i < wl.length; i++){
            if(wl[i].id === id){
                return i;
            }
        }
        return -1;
    };

    var kill = function () {
        clearInterval(NulledBot.room.autodisableInterval);
        clearInterval(NulledBot.room.afkInterval);
        NulledBot.status = false;
    };

    // This socket server is used solely for statistical and troubleshooting purposes.
    // This server may not always be up, but will be used to get live data at any given time.

    /*var socket = function () {
        function loadSocket() {
            SockJS.prototype.msg = function(a){this.send(JSON.stringify(a))};
            sock = new SockJS('https://benzi.io:4964/socket');
            sock.onopen = function() {
                console.log('Connected to socket!');
                sendToSocket();
            };
            sock.onclose = function() {
                console.log('Disconnected from socket, reconnecting every minute ..');
                var reconnect = setTimeout(function(){ loadSocket() }, 60 * 1000);
            };
            sock.onmessage = function(broadcast) {
                var rawBroadcast = broadcast.data;
                var broadcastMessage = rawBroadcast.replace(/["\\]+/g, '');
                API.chatLog(broadcastMessage);
                console.log(broadcastMessage);
            };
        }
        if (typeof SockJS == 'undefined') {
            $.getScript('https://cdn.jsdelivr.net/sockjs/1.0.3/sockjs.min.js', loadSocket);
        } else loadSocket();
    }

    var sendToSocket = function () {
        var NulledBotSettings = NulledBot.settings;
        var NulledBotRoom = NulledBot.room;
        var NulledBotInfo = {
            time: Date.now(),
            version: NulledBot.version
        };
        var data = {users:API.getUsers(),userinfo:API.getUser(),room:location.pathname,NulledBotSettings:NulledBotSettings,NulledBotRoom:NulledBotRoom,NulledBotInfo:NulledBotInfo};
        return sock.msg(data);
    };*/

    var storeToStorage = function () {
        localStorage.setItem("NulledBotsettings", JSON.stringify(NulledBot.settings));
        localStorage.setItem("NulledBotRoom", JSON.stringify(NulledBot.room));
        var NulledBotStorageInfo = {
            time: Date.now(),
            stored: true,
            version: NulledBot.version
        };
        localStorage.setItem("NulledBotStorageInfo", JSON.stringify(NulledBotStorageInfo));

    };

    var subChat = function (chat, obj) {
        if (typeof chat === "undefined") {
            API.chatLog("There is a chat text missing.");
            console.log("There is a chat text missing.");
            return "[Error] No text message found.";

            // TODO: Get missing chat messages from source.
        }
        var lit = '%%';
        for (var prop in obj) {
            chat = chat.replace(lit + prop.toUpperCase() + lit, obj[prop]);
        }
        return chat;
    };

    var loadChat = function (cb) {
        if (!cb) cb = function () {
        };
        $.get("https://rawgit.com/NulledBot/source/master/lang/langIndex.json", function (json) {
            var link = NulledBot.chatLink;
            if (json !== null && typeof json !== "undefined") {
                langIndex = json;
                link = langIndex[NulledBot.settings.language.toLowerCase()];
                if (NulledBot.settings.chatLink !== NulledBot.chatLink) {
                    link = NulledBot.settings.chatLink;
                }
                else {
                    if (typeof link === "undefined") {
                        link = NulledBot.chatLink;
                    }
                }
                $.get(link, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        NulledBot.chat = json;
                        cb();
                    }
                });
            }
            else {
                $.get(NulledBot.chatLink, function (json) {
                    if (json !== null && typeof json !== "undefined") {
                        if (typeof json === "string") json = JSON.parse(json);
                        NulledBot.chat = json;
                        cb();
                    }
                });
            }
        });
    };

    var retrieveSettings = function () {
        var settings = JSON.parse(localStorage.getItem("NulledBotsettings"));
        if (settings !== null) {
            for (var prop in settings) {
                NulledBot.settings[prop] = settings[prop];
            }
        }
    };

    var retrieveFromStorage = function () {
        var info = localStorage.getItem("NulledBotStorageInfo");
        if (info === null) API.chatLog(NulledBot.chat.nodatafound);
        else {
            var settings = JSON.parse(localStorage.getItem("NulledBotsettings"));
            var room = JSON.parse(localStorage.getItem("NulledBotRoom"));
            var elapsed = Date.now() - JSON.parse(info).time;
            if ((elapsed < 1 * 60 * 60 * 1000)) {
                API.chatLog(NulledBot.chat.retrievingdata);
                for (var prop in settings) {
                    NulledBot.settings[prop] = settings[prop];
                }
                NulledBot.room.users = room.users;
                NulledBot.room.afkList = room.afkList;
                NulledBot.room.historyList = room.historyList;
                NulledBot.room.mutedUsers = room.mutedUsers;
                //NulledBot.room.autoskip = room.autoskip;
                NulledBot.room.roomstats = room.roomstats;
                NulledBot.room.messages = room.messages;
                NulledBot.room.queue = room.queue;
                NulledBot.room.newBlacklisted = room.newBlacklisted;
                API.chatLog(NulledBot.chat.datarestored);
            }
        }
        var json_sett = null;
        var roominfo = document.getElementById("room-settings");
        info = roominfo.textContent;
        var ref_bot = "@NulledBot=";
        var ind_ref = info.indexOf(ref_bot);
        if (ind_ref > 0) {
            var link = info.substring(ind_ref + ref_bot.length, info.length);
            var ind_space = null;
            if (link.indexOf(" ") < link.indexOf("\n")) ind_space = link.indexOf(" ");
            else ind_space = link.indexOf("\n");
            link = link.substring(0, ind_space);
            $.get(link, function (json) {
                if (json !== null && typeof json !== "undefined") {
                    json_sett = JSON.parse(json);
                    for (var prop in json_sett) {
                        NulledBot.settings[prop] = json_sett[prop];
                    }
                }
            });
        }

    };

    String.prototype.splitBetween = function (a, b) {
        var self = this;
        self = this.split(a);
        for (var i = 0; i < self.length; i++) {
            self[i] = self[i].split(b);
        }
        var arr = [];
        for (var i = 0; i < self.length; i++) {
            if (Array.isArray(self[i])) {
                for (var j = 0; j < self[i].length; j++) {
                    arr.push(self[i][j]);
                }
            }
            else arr.push(self[i]);
        }
        return arr;
    };

    String.prototype.startsWith = function(str) {
      return this.substring(0, str.length) === str;
    };

    function linkFixer(msg) {
        var parts = msg.splitBetween('<a href="', '<\/a>');
        for (var i = 1; i < parts.length; i = i + 2) {
            var link = parts[i].split('"')[0];
            parts[i] = link;
        }
        var m = '';
        for (var i = 0; i < parts.length; i++) {
            m += parts[i];
        }
        return m;
    };

    function decodeEntities(s) {
        var str, temp = document.createElement('p');
        temp.innerHTML = s;
        str = temp.textContent || temp.innerText;
        temp = null;
        return str;
    };

    var botCreator = "Yemasthui";
    var botMaintainer = "Benzi"
    var botCreatorIDs = ["3851534", "4105209"];

    var NulledBot = {
        version: "2.9.1",
        status: false,
        name: "NulledBot",
        loggedInID: null,
        scriptLink: "https://rawgit.com/NulledBot/source/master/NulledBot.js",
        cmdLink: "http://git.io/245Ppg",
        chatLink: "https://rawgit.com/NulledBot/source/master/lang/en.json",
        chat: null,
        loadChat: loadChat,
        retrieveSettings: retrieveSettings,
        retrieveFromStorage: retrieveFromStorage,
        settings: {
            botName: "NulledBot",
            language: "english",
            chatLink: "https://rawgit.com/NulledBot/source/master/lang/en.json",
            scriptLink: "https://rawgit.com/NulledBot/source/master/NulledBot.js",
            roomLock: false, // Requires an extension to re-load the script
            startupCap: 1, // 1-200
            startupVolume: 0, // 0-100
            startupEmoji: false, // true or false
            autowoot: true,
            autoskip: false,
            smartSkip: true,
            cmdDeletion: true,
            maximumAfk: 120,
            afkRemoval: true,
            maximumDc: 60,
            bouncerPlus: true,
            blacklistEnabled: true,
            lockdownEnabled: false,
            lockGuard: false,
            maximumLocktime: 10,
            cycleGuard: true,
            maximumCycletime: 10,
            voteSkip: false,
            voteSkipLimit: 10,
            historySkip: false,
            timeGuard: true,
            maximumSongLength: 10,
            autodisable: false,
            commandCooldown: 30,
            usercommandsEnabled: true,
            thorCommand: false,
            thorCooldown: 10,
            skipPosition: 3,
            skipReasons: [
                ["theme", "This song does not fit the room theme. "],
                ["op", "This song is on the OP list. "],
                ["history", "This song is in the history. "],
                ["mix", "You played a mix, which is against the rules. "],
                ["sound", "The song you played had bad sound quality or no sound. "],
                ["nsfw", "The song you contained was NSFW (image or sound). "],
                ["unavailable", "The song you played was not available for some users. "]
            ],
            afkpositionCheck: 15,
            afkRankCheck: "ambassador",
            motdEnabled: false,
            motdInterval: 5,
            motd: "Temporary Message of the Day",
            filterChat: true,
            etaRestriction: false,
            welcome: true,
            opLink: null,
            rulesLink: null,
            themeLink: null,
            fbLink: null,
            youtubeLink: null,
            website: null,
            intervalMessages: [],
            messageInterval: 5,
            songstats: true,
            commandLiteral: "!",
            blacklists: {
                NSFW: "https://rawgit.com/NulledBot/custom/master/blacklists/NSFWlist.json",
                OP: "https://rawgit.com/NulledBot/custom/master/blacklists/OPlist.json",
                BANNED: "https://rawgit.com/NulledBot/custom/master/blacklists/BANNEDlist.json"
            }
        },
        room: {
            name: null,
            chatMessages: [],
            users: [],
            afkList: [],
            mutedUsers: [],
            bannedUsers: [],
            skippable: true,
            usercommand: true,
            allcommand: true,
            afkInterval: null,
            //autoskip: false,
            autoskipTimer: null,
            autodisableInterval: null,
            autodisableFunc: function () {
                if (NulledBot.status && NulledBot.settings.autodisable) {
                    API.sendChat('!afkdisable');
                    API.sendChat('!joindisable');
                }
            },
            queueing: 0,
            queueable: true,
            currentDJID: null,
            historyList: [],
            cycleTimer: setTimeout(function () {
            }, 1),
            roomstats: {
                accountName: null,
                totalWoots: 0,
                totalCurates: 0,
                totalMehs: 0,
                launchTime: null,
                songCount: 0,
                chatmessages: 0
            },
            messages: {
                from: [],
                to: [],
                message: []
            },
            queue: {
                id: [],
                position: []
            },
            blacklists: {

            },
            newBlacklisted: [],
            newBlacklistedSongFunction: null,
            roulette: {
                rouletteStatus: false,
                participants: [],
                countdown: null,
                startRoulette: function () {
                    NulledBot.room.roulette.rouletteStatus = true;
                    NulledBot.room.roulette.countdown = setTimeout(function () {
                        NulledBot.room.roulette.endRoulette();
                    }, 60 * 1000);
                    API.sendChat(NulledBot.chat.isopen);
                },
                endRoulette: function () {
                    NulledBot.room.roulette.rouletteStatus = false;
                    var ind = Math.floor(Math.random() * NulledBot.room.roulette.participants.length);
                    var winner = NulledBot.room.roulette.participants[ind];
                    NulledBot.room.roulette.participants = [];
                    var pos = Math.floor((Math.random() * API.getWaitList().length) + 1);
                    var user = NulledBot.userUtilities.lookupUser(winner);
                    var name = user.username;
                    API.sendChat(subChat(NulledBot.chat.winnerpicked, {name: name, position: pos}));
                    setTimeout(function (winner, pos) {
                        NulledBot.userUtilities.moveUser(winner, pos, false);
                    }, 1 * 1000, winner, pos);
                }
            },
            usersUsedThor: []
        },
        User: function (id, name) {
            this.id = id;
            this.username = name;
            this.jointime = Date.now();
            this.lastActivity = Date.now();
            this.votes = {
                woot: 0,
                meh: 0,
                curate: 0
            };
            this.lastEta = null;
            this.afkWarningCount = 0;
            this.afkCountdown = null;
            this.inRoom = true;
            this.isMuted = false;
            this.lastDC = {
                time: null,
                position: null,
                songCount: 0
            };
            this.lastKnownPosition = null;
        },
        userUtilities: {
            getJointime: function (user) {
                return user.jointime;
            },
            getUser: function (user) {
                return API.getUser(user.id);
            },
            updatePosition: function (user, newPos) {
                user.lastKnownPosition = newPos;
            },
            updateDC: function (user) {
                user.lastDC.time = Date.now();
                user.lastDC.position = user.lastKnownPosition;
                user.lastDC.songCount = NulledBot.room.roomstats.songCount;
            },
            setLastActivity: function (user) {
                user.lastActivity = Date.now();
                user.afkWarningCount = 0;
                clearTimeout(user.afkCountdown);
            },
            getLastActivity: function (user) {
                return user.lastActivity;
            },
            getWarningCount: function (user) {
                return user.afkWarningCount;
            },
            setWarningCount: function (user, value) {
                user.afkWarningCount = value;
            },
            lookupUser: function (id) {
                for (var i = 0; i < NulledBot.room.users.length; i++) {
                    if (NulledBot.room.users[i].id === id) {
                        return NulledBot.room.users[i];
                    }
                }
                return false;
            },
            lookupUserName: function (name) {
                for (var i = 0; i < NulledBot.room.users.length; i++) {
                    var match = NulledBot.room.users[i].username.trim() == name.trim();
                    if (match) {
                        return NulledBot.room.users[i];
                    }
                }
                return false;
            },
            voteRatio: function (id) {
                var user = NulledBot.userUtilities.lookupUser(id);
                var votes = user.votes;
                if (votes.meh === 0) votes.ratio = 1;
                else votes.ratio = (votes.woot / votes.meh).toFixed(2);
                return votes;

            },
            getPermission: function (obj) { //1 requests
                var u;
                if (typeof obj === "object") u = obj;
                else u = API.getUser(obj);
                for (var i = 0; i < botCreatorIDs.length; i++) {
                    if (botCreatorIDs[i].indexOf(u.id) > -1) return 10;
                }
                if (u.gRole < 2) return u.role;
                else {
                    switch (u.gRole) {
                        case 2:
                            return 7;
                        case 3:
                            return 8;
                        case 4:
                            return 9;
                        case 5:
                            return 10;
                    }
                }
                return 0;
            },
            moveUser: function (id, pos, priority) {
                var user = NulledBot.userUtilities.lookupUser(id);
                var wlist = API.getWaitList();
                if (API.getWaitListPosition(id) === -1) {
                    if (wlist.length < 50) {
                        API.moderateAddDJ(id);
                        if (pos !== 0) setTimeout(function (id, pos) {
                            API.moderateMoveDJ(id, pos);
                        }, 1250, id, pos);
                    }
                    else {
                        var alreadyQueued = -1;
                        for (var i = 0; i < NulledBot.room.queue.id.length; i++) {
                            if (NulledBot.room.queue.id[i] === id) alreadyQueued = i;
                        }
                        if (alreadyQueued !== -1) {
                            NulledBot.room.queue.position[alreadyQueued] = pos;
                            return API.sendChat(subChat(NulledBot.chat.alreadyadding, {position: NulledBot.room.queue.position[alreadyQueued]}));
                        }
                        NulledBot.roomUtilities.booth.lockBooth();
                        if (priority) {
                            NulledBot.room.queue.id.unshift(id);
                            NulledBot.room.queue.position.unshift(pos);
                        }
                        else {
                            NulledBot.room.queue.id.push(id);
                            NulledBot.room.queue.position.push(pos);
                        }
                        var name = user.username;
                        return API.sendChat(subChat(NulledBot.chat.adding, {name: name, position: NulledBot.room.queue.position.length}));
                    }
                }
                else API.moderateMoveDJ(id, pos);
            },
            dclookup: function (id) {
                var user = NulledBot.userUtilities.lookupUser(id);
                if (typeof user === 'boolean') return NulledBot.chat.usernotfound;
                var name = user.username;
                if (user.lastDC.time === null) return subChat(NulledBot.chat.notdisconnected, {name: name});
                var dc = user.lastDC.time;
                var pos = user.lastDC.position;
                if (pos === null) return NulledBot.chat.noposition;
                var timeDc = Date.now() - dc;
                var validDC = false;
                if (NulledBot.settings.maximumDc * 60 * 1000 > timeDc) {
                    validDC = true;
                }
                var time = NulledBot.roomUtilities.msToStr(timeDc);
                if (!validDC) return (subChat(NulledBot.chat.toolongago, {name: NulledBot.userUtilities.getUser(user).username, time: time}));
                var songsPassed = NulledBot.room.roomstats.songCount - user.lastDC.songCount;
                var afksRemoved = 0;
                var afkList = NulledBot.room.afkList;
                for (var i = 0; i < afkList.length; i++) {
                    var timeAfk = afkList[i][1];
                    var posAfk = afkList[i][2];
                    if (dc < timeAfk && posAfk < pos) {
                        afksRemoved++;
                    }
                }
                var newPosition = user.lastDC.position - songsPassed - afksRemoved;
                if (newPosition <= 0) return subChat(NulledBot.chat.notdisconnected, {name: name});
                var msg = subChat(NulledBot.chat.valid, {name: NulledBot.userUtilities.getUser(user).username, time: time, position: newPosition});
                NulledBot.userUtilities.moveUser(user.id, newPosition, true);
                return msg;
            }
        },

        roomUtilities: {
            rankToNumber: function (rankString) {
                var rankInt = null;
                switch (rankString) {
                    case "admin":
                        rankInt = 10;
                        break;
                    case "ambassador":
                        rankInt = 7;
                        break;
                    case "host":
                        rankInt = 5;
                        break;
                    case "cohost":
                        rankInt = 4;
                        break;
                    case "manager":
                        rankInt = 3;
                        break;
                    case "bouncer":
                        rankInt = 2;
                        break;
                    case "residentdj":
                        rankInt = 1;
                        break;
                    case "user":
                        rankInt = 0;
                        break;
                }
                return rankInt;
            },
            msToStr: function (msTime) {
                var ms, msg, timeAway;
                msg = '';
                timeAway = {
                    'days': 0,
                    'hours': 0,
                    'minutes': 0,
                    'seconds': 0
                };
                ms = {
                    'day': 24 * 60 * 60 * 1000,
                    'hour': 60 * 60 * 1000,
                    'minute': 60 * 1000,
                    'second': 1000
                };
                if (msTime > ms.day) {
                    timeAway.days = Math.floor(msTime / ms.day);
                    msTime = msTime % ms.day;
                }
                if (msTime > ms.hour) {
                    timeAway.hours = Math.floor(msTime / ms.hour);
                    msTime = msTime % ms.hour;
                }
                if (msTime > ms.minute) {
                    timeAway.minutes = Math.floor(msTime / ms.minute);
                    msTime = msTime % ms.minute;
                }
                if (msTime > ms.second) {
                    timeAway.seconds = Math.floor(msTime / ms.second);
                }
                if (timeAway.days !== 0) {
                    msg += timeAway.days.toString() + 'd';
                }
                if (timeAway.hours !== 0) {
                    msg += timeAway.hours.toString() + 'h';
                }
                if (timeAway.minutes !== 0) {
                    msg += timeAway.minutes.toString() + 'm';
                }
                if (timeAway.minutes < 1 && timeAway.hours < 1 && timeAway.days < 1) {
                    msg += timeAway.seconds.toString() + 's';
                }
                if (msg !== '') {
                    return msg;
                } else {
                    return false;
                }
            },
            booth: {
                lockTimer: setTimeout(function () {
                }, 1000),
                locked: false,
                lockBooth: function () {
                    API.moderateLockWaitList(!NulledBot.roomUtilities.booth.locked);
                    NulledBot.roomUtilities.booth.locked = false;
                    if (NulledBot.settings.lockGuard) {
                        NulledBot.roomUtilities.booth.lockTimer = setTimeout(function () {
                            API.moderateLockWaitList(NulledBot.roomUtilities.booth.locked);
                        }, NulledBot.settings.maximumLocktime * 60 * 1000);
                    }
                },
                unlockBooth: function () {
                    API.moderateLockWaitList(NulledBot.roomUtilities.booth.locked);
                    clearTimeout(NulledBot.roomUtilities.booth.lockTimer);
                }
            },
            afkCheck: function () {
                if (!NulledBot.status || !NulledBot.settings.afkRemoval) return void (0);
                var rank = NulledBot.roomUtilities.rankToNumber(NulledBot.settings.afkRankCheck);
                var djlist = API.getWaitList();
                var lastPos = Math.min(djlist.length, NulledBot.settings.afkpositionCheck);
                if (lastPos - 1 > djlist.length) return void (0);
                for (var i = 0; i < lastPos; i++) {
                    if (typeof djlist[i] !== 'undefined') {
                        var id = djlist[i].id;
                        var user = NulledBot.userUtilities.lookupUser(id);
                        if (typeof user !== 'boolean') {
                            var plugUser = NulledBot.userUtilities.getUser(user);
                            if (rank !== null && NulledBot.userUtilities.getPermission(plugUser) <= rank) {
                                var name = plugUser.username;
                                var lastActive = NulledBot.userUtilities.getLastActivity(user);
                                var inactivity = Date.now() - lastActive;
                                var time = NulledBot.roomUtilities.msToStr(inactivity);
                                var warncount = user.afkWarningCount;
                                if (inactivity > NulledBot.settings.maximumAfk * 60 * 1000) {
                                    if (warncount === 0) {
                                        API.sendChat(subChat(NulledBot.chat.warning1, {name: name, time: time}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 1;
                                        }, 90 * 1000, user);
                                    }
                                    else if (warncount === 1) {
                                        API.sendChat(subChat(NulledBot.chat.warning2, {name: name}));
                                        user.afkWarningCount = 3;
                                        user.afkCountdown = setTimeout(function (userToChange) {
                                            userToChange.afkWarningCount = 2;
                                        }, 30 * 1000, user);
                                    }
                                    else if (warncount === 2) {
                                        var pos = API.getWaitListPosition(id);
                                        if (pos !== -1) {
                                            pos++;
                                            NulledBot.room.afkList.push([id, Date.now(), pos]);
                                            user.lastDC = {

                                                time: null,
                                                position: null,
                                                songCount: 0
                                            };
                                            API.moderateRemoveDJ(id);
                                            API.sendChat(subChat(NulledBot.chat.afkremove, {name: name, time: time, position: pos, maximumafk: NulledBot.settings.maximumAfk}));
                                        }
                                        user.afkWarningCount = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            },
            smartSkip: function (reason) {
                var dj = API.getDJ();
                var id = dj.id;
                var waitlistlength = API.getWaitList().length;
                var locked = false;
                NulledBot.room.queueable = false;

                if (waitlistlength == 50) {
                    NulledBot.roomUtilities.booth.lockBooth();
                    locked = true;
                }
                setTimeout(function (id) {
                    API.moderateForceSkip();
                    setTimeout(function () {
                        if (typeof reason !== 'undefined') {
                            API.sendChat(reason);
                        }
                    }, 500);
                    NulledBot.room.skippable = false;
                    setTimeout(function () {
                        NulledBot.room.skippable = true
                    }, 5 * 1000);
                    setTimeout(function (id) {
                        NulledBot.userUtilities.moveUser(id, NulledBot.settings.skipPosition, false);
                        NulledBot.room.queueable = true;
                        if (locked) {
                            setTimeout(function () {
                                NulledBot.roomUtilities.booth.unlockBooth();
                            }, 1000);
                        }
                    }, 1500, id);
                }, 1000, id);
            },
            changeDJCycle: function () {
                $.getJSON('/_/rooms/state', function(data) {
                    if (data.data[0].booth.shouldCycle) { // checks "" "shouldCycle": true "" if its true
                        API.moderateDJCycle(false); // Disables the DJ Cycle
                        clearTimeout(NulledBot.room.cycleTimer); // Clear the cycleguard timer
                    } else { // If cycle is already disable; enable it
                        if (NulledBot.settings.cycleGuard) { // Is cycle guard on?
                        API.moderateDJCycle(true); // Enables DJ cycle
                        NulledBot.room.cycleTimer = setTimeout(function () {  // Start timer
                            API.moderateDJCycle(false); // Disable cycle
                        }, NulledBot.settings.maximumCycletime * 60 * 1000); // The time
                        } else { // So cycleguard is not on?
                         API.moderateDJCycle(true); // Enables DJ cycle
                        }
                    };
                });
            },
            intervalMessage: function () {
                var interval;
                if (NulledBot.settings.motdEnabled) interval = NulledBot.settings.motdInterval;
                else interval = NulledBot.settings.messageInterval;
                if ((NulledBot.room.roomstats.songCount % interval) === 0 && NulledBot.status) {
                    var msg;
                    if (NulledBot.settings.motdEnabled) {
                        msg = NulledBot.settings.motd;
                    }
                    else {
                        if (NulledBot.settings.intervalMessages.length === 0) return void (0);
                        var messageNumber = NulledBot.room.roomstats.songCount % NulledBot.settings.intervalMessages.length;
                        msg = NulledBot.settings.intervalMessages[messageNumber];
                    }
                    API.sendChat('/me ' + msg);
                }
            },
            updateBlacklists: function () {
                for (var bl in NulledBot.settings.blacklists) {
                    NulledBot.room.blacklists[bl] = [];
                    if (typeof NulledBot.settings.blacklists[bl] === 'function') {
                        NulledBot.room.blacklists[bl] = NulledBot.settings.blacklists();
                    }
                    else if (typeof NulledBot.settings.blacklists[bl] === 'string') {
                        if (NulledBot.settings.blacklists[bl] === '') {
                            continue;
                        }
                        try {
                            (function (l) {
                                $.get(NulledBot.settings.blacklists[l], function (data) {
                                    if (typeof data === 'string') {
                                        data = JSON.parse(data);
                                    }
                                    var list = [];
                                    for (var prop in data) {
                                        if (typeof data[prop].mid !== 'undefined') {
                                            list.push(data[prop].mid);
                                        }
                                    }
                                    NulledBot.room.blacklists[l] = list;
                                })
                            })(bl);
                        }
                        catch (e) {
                            API.chatLog('Error setting' + bl + 'blacklist.');
                            console.log('Error setting' + bl + 'blacklist.');
                            console.log(e);
                        }
                    }
                }
            },
            logNewBlacklistedSongs: function () {
                if (typeof console.table !== 'undefined') {
                    console.table(NulledBot.room.newBlacklisted);
                }
                else {
                    console.log(NulledBot.room.newBlacklisted);
                }
            },
            exportNewBlacklistedSongs: function () {
                var list = {};
                for (var i = 0; i < NulledBot.room.newBlacklisted.length; i++) {
                    var track = NulledBot.room.newBlacklisted[i];
                    list[track.list] = [];
                    list[track.list].push({
                        title: track.title,
                        author: track.author,
                        mid: track.mid
                    });
                }
                return list;
            }
        },
        eventChat: function (chat) {
            chat.message = linkFixer(chat.message);
            chat.message = decodeEntities(chat.message);
            chat.message = chat.message.trim();

            NulledBot.room.chatMessages.push([chat.cid, chat.message, chat.sub, chat.timestamp, chat.type, chat.uid, chat.un]);

            for (var i = 0; i < NulledBot.room.users.length; i++) {
                if (NulledBot.room.users[i].id === chat.uid) {
                    NulledBot.userUtilities.setLastActivity(NulledBot.room.users[i]);
                    if (NulledBot.room.users[i].username !== chat.un) {
                        NulledBot.room.users[i].username = chat.un;
                    }
                }
            }
            if (NulledBot.chatUtilities.chatFilter(chat)) return void (0);
            if (!NulledBot.chatUtilities.commandCheck(chat))
                NulledBot.chatUtilities.action(chat);
        },
        eventUserjoin: function (user) {
            var known = false;
            var index = null;
            for (var i = 0; i < NulledBot.room.users.length; i++) {
                if (NulledBot.room.users[i].id === user.id) {
                    known = true;
                    index = i;
                }
            }
            var greet = true;
            var welcomeback = null;
            if (known) {
                NulledBot.room.users[index].inRoom = true;
                var u = NulledBot.userUtilities.lookupUser(user.id);
                var jt = u.jointime;
                var t = Date.now() - jt;
                if (t < 10 * 1000) greet = false;
                else welcomeback = true;
            }
            else {
                NulledBot.room.users.push(new NulledBot.User(user.id, user.username));
                welcomeback = false;
            }
            for (var j = 0; j < NulledBot.room.users.length; j++) {
                if (NulledBot.userUtilities.getUser(NulledBot.room.users[j]).id === user.id) {
                    NulledBot.userUtilities.setLastActivity(NulledBot.room.users[j]);
                    NulledBot.room.users[j].jointime = Date.now();
                }

            }
            if (NulledBot.settings.welcome && greet) {
                welcomeback ?
                    setTimeout(function (user) {
                        API.sendChat(subChat(NulledBot.chat.welcomeback, {name: user.username}));
                    }, 1 * 1000, user)
                    :
                    setTimeout(function (user) {
                        API.sendChat(subChat(NulledBot.chat.welcome, {name: user.username}));
                    }, 1 * 1000, user);
            }
        },
        eventUserleave: function (user) {
            var lastDJ = API.getHistory()[0].user.id;
            for (var i = 0; i < NulledBot.room.users.length; i++) {
                if (NulledBot.room.users[i].id === user.id) {
                    NulledBot.userUtilities.updateDC(NulledBot.room.users[i]);
                    NulledBot.room.users[i].inRoom = false;
                    if (lastDJ == user.id){
                        var user = NulledBot.userUtilities.lookupUser(NulledBot.room.users[i].id);
                        NulledBot.userUtilities.updatePosition(user, 0);
                        user.lastDC.time = null;
                        user.lastDC.position = user.lastKnownPosition;
                    }
                }
            }
        },
        eventVoteupdate: function (obj) {
            for (var i = 0; i < NulledBot.room.users.length; i++) {
                if (NulledBot.room.users[i].id === obj.user.id) {
                    if (obj.vote === 1) {
                        NulledBot.room.users[i].votes.woot++;
                    }
                    else {
                        NulledBot.room.users[i].votes.meh++;
                    }
                }
            }

            var mehs = API.getScore().negative;
            var woots = API.getScore().positive;
            var dj = API.getDJ();
            var timeLeft = API.getTimeRemaining();
            var timeElapsed = API.getTimeElapsed();

            if (NulledBot.settings.voteSkip) {
                if ((mehs - woots) >= (NulledBot.settings.voteSkipLimit)) {
                    API.sendChat(subChat(NulledBot.chat.voteskipexceededlimit, {name: dj.username, limit: NulledBot.settings.voteSkipLimit}));
                    if (NulledBot.settings.smartSkip && timeLeft > timeElapsed){
                        NulledBot.roomUtilities.smartSkip();
                    }
                    else {
                        API.moderateForceSkip();
                    }
                }
            }

        },
        eventCurateupdate: function (obj) {
            for (var i = 0; i < NulledBot.room.users.length; i++) {
                if (NulledBot.room.users[i].id === obj.user.id) {
                    NulledBot.room.users[i].votes.curate++;
                }
            }
        },
        eventDjadvance: function (obj) {
            if (NulledBot.settings.autowoot) {
                $("#woot").click(); // autowoot
            }

            var user = NulledBot.userUtilities.lookupUser(obj.dj.id)
            for(var i = 0; i < NulledBot.room.users.length; i++){
                if(NulledBot.room.users[i].id === user.id){
                    NulledBot.room.users[i].lastDC = {
                        time: null,
                        position: null,
                        songCount: 0
                    };
                }
            }

            var lastplay = obj.lastPlay;
            if (typeof lastplay === 'undefined') return;
            if (NulledBot.settings.songstats) {
                if (typeof NulledBot.chat.songstatistics === "undefined") {
                    API.sendChat("/me " + lastplay.media.author + " - " + lastplay.media.title + ": " + lastplay.score.positive + "W/" + lastplay.score.grabs + "G/" + lastplay.score.negative + "M.")
                }
                else {
                    API.sendChat(subChat(NulledBot.chat.songstatistics, {artist: lastplay.media.author, title: lastplay.media.title, woots: lastplay.score.positive, grabs: lastplay.score.grabs, mehs: lastplay.score.negative}))
                }
            }
            NulledBot.room.roomstats.totalWoots += lastplay.score.positive;
            NulledBot.room.roomstats.totalMehs += lastplay.score.negative;
            NulledBot.room.roomstats.totalCurates += lastplay.score.grabs;
            NulledBot.room.roomstats.songCount++;
            NulledBot.roomUtilities.intervalMessage();
            NulledBot.room.currentDJID = obj.dj.id;

            var blacklistSkip = setTimeout(function () {
                var mid = obj.media.format + ':' + obj.media.cid;
                for (var bl in NulledBot.room.blacklists) {
                    if (NulledBot.settings.blacklistEnabled) {
                        if (NulledBot.room.blacklists[bl].indexOf(mid) > -1) {
                            API.sendChat(subChat(NulledBot.chat.isblacklisted, {blacklist: bl}));
                            if (NulledBot.settings.smartSkip){
                                return NulledBot.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                }
            }, 2000);
            var newMedia = obj.media;
            var timeLimitSkip = setTimeout(function () {
                if (NulledBot.settings.timeGuard && newMedia.duration > NulledBot.settings.maximumSongLength * 60 && !NulledBot.room.roomevent) {
                    var name = obj.dj.username;
                    API.sendChat(subChat(NulledBot.chat.timelimit, {name: name, maxlength: NulledBot.settings.maximumSongLength}));
                    if (NulledBot.settings.smartSkip){
                        return NulledBot.roomUtilities.smartSkip();
                    }
                    else {
                        return API.moderateForceSkip();
                    }
                }
            }, 2000);
            var format = obj.media.format;
            var cid = obj.media.cid;
            var naSkip = setTimeout(function () {
                if (format == 1){
                    $.getJSON('https://www.googleapis.com/youtube/v3/videos?id=' + cid + '&key=AIzaSyDcfWu9cGaDnTjPKhg_dy9mUh6H7i4ePZ0&part=snippet&callback=?', function (track){
                        if (typeof(track.items[0]) === 'undefined'){
                            var name = obj.dj.username;
                            API.sendChat(subChat(NulledBot.chat.notavailable, {name: name}));
                            if (NulledBot.settings.smartSkip){
                                return NulledBot.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
                else {
                    var checkSong = SC.get('/tracks/' + cid, function (track){
                        if (typeof track.title === 'undefined'){
                            var name = obj.dj.username;
                            API.sendChat(subChat(NulledBot.chat.notavailable, {name: name}));
                            if (NulledBot.settings.smartSkip){
                                return NulledBot.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    });
                }
            }, 2000);
            clearTimeout(historySkip);
            if (NulledBot.settings.historySkip) {
                var alreadyPlayed = false;
                var apihistory = API.getHistory();
                var name = obj.dj.username;
                var historySkip = setTimeout(function () {
                    for (var i = 0; i < apihistory.length; i++) {
                        if (apihistory[i].media.cid === obj.media.cid) {
                            NulledBot.room.historyList[i].push(+new Date());
                            alreadyPlayed = true;
                            API.sendChat(subChat(NulledBot.chat.songknown, {name: name}));
                            if (NulledBot.settings.smartSkip){
                                return NulledBot.roomUtilities.smartSkip();
                            }
                            else {
                                return API.moderateForceSkip();
                            }
                        }
                    }
                    if (!alreadyPlayed) {
                        NulledBot.room.historyList.push([obj.media.cid, +new Date()]);
                    }
                }, 2000);
            }
            if (user.ownSong) {
                API.sendChat(subChat(NulledBot.chat.permissionownsong, {name: user.username}));
                user.ownSong = false;
            }
            clearTimeout(NulledBot.room.autoskipTimer);
            if (NulledBot.settings.autoskip) {
                var remaining = obj.media.duration * 1000;
                var startcid = API.getMedia().cid;
                NulledBot.room.autoskipTimer = setTimeout(function() {
                    var endcid = API.getMedia().cid;
                    if (startcid === endcid) {
                        //API.sendChat('Song stuck, skipping...');
                        API.moderateForceSkip();
                    }
                }, remaining + 5000);
            }
            storeToStorage();
            //sendToSocket();
        },
        eventWaitlistupdate: function (users) {
            if (users.length < 50) {
                if (NulledBot.room.queue.id.length > 0 && NulledBot.room.queueable) {
                    NulledBot.room.queueable = false;
                    setTimeout(function () {
                        NulledBot.room.queueable = true;
                    }, 500);
                    NulledBot.room.queueing++;
                    var id, pos;
                    setTimeout(
                        function () {
                            id = NulledBot.room.queue.id.splice(0, 1)[0];
                            pos = NulledBot.room.queue.position.splice(0, 1)[0];
                            API.moderateAddDJ(id, pos);
                            setTimeout(
                                function (id, pos) {
                                    API.moderateMoveDJ(id, pos);
                                    NulledBot.room.queueing--;
                                    if (NulledBot.room.queue.id.length === 0) setTimeout(function () {
                                        NulledBot.roomUtilities.booth.unlockBooth();
                                    }, 1000);
                                }, 1000, id, pos);
                        }, 1000 + NulledBot.room.queueing * 2500);
                }
            }
            for (var i = 0; i < users.length; i++) {
                var user = NulledBot.userUtilities.lookupUser(users[i].id);
                NulledBot.userUtilities.updatePosition(user, API.getWaitListPosition(users[i].id) + 1);
            }
        },
        chatcleaner: function (chat) {
            if (!NulledBot.settings.filterChat) return false;
            if (NulledBot.userUtilities.getPermission(chat.uid) > 1) return false;
            var msg = chat.message;
            var containsLetters = false;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ':' || ch === '^') containsLetters = true;
            }
            if (msg === '') {
                return true;
            }
            if (!containsLetters && (msg.length === 1 || msg.length > 3)) return true;
            msg = msg.replace(/[ ,;.:\/=~+%^*\-\\"'&@#]/g, '');
            var capitals = 0;
            var ch;
            for (var i = 0; i < msg.length; i++) {
                ch = msg.charAt(i);
                if (ch >= 'A' && ch <= 'Z') capitals++;
            }
            if (capitals >= 40) {
                API.sendChat(subChat(NulledBot.chat.caps, {name: chat.un}));
                return true;
            }
            msg = msg.toLowerCase();
            if (msg === 'skip') {
                API.sendChat(subChat(NulledBot.chat.askskip, {name: chat.un}));
                return true;
            }
            for (var j = 0; j < NulledBot.chatUtilities.spam.length; j++) {
                if (msg === NulledBot.chatUtilities.spam[j]) {
                    API.sendChat(subChat(NulledBot.chat.spam, {name: chat.un}));
                    return true;
                }
            }
            return false;
        },
        chatUtilities: {
            chatFilter: function (chat) {
                var msg = chat.message;
                var perm = NulledBot.userUtilities.getPermission(chat.uid);
                var user = NulledBot.userUtilities.lookupUser(chat.uid);
                var isMuted = false;
                for (var i = 0; i < NulledBot.room.mutedUsers.length; i++) {
                    if (NulledBot.room.mutedUsers[i] === chat.uid) isMuted = true;
                }
                if (isMuted) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (NulledBot.settings.lockdownEnabled) {
                    if (perm === 0) {
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                if (NulledBot.chatcleaner(chat)) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }
                if (NulledBot.settings.cmdDeletion && msg.startsWith(NulledBot.settings.commandLiteral)) {
                    API.moderateDeleteChat(chat.cid);
                }
                /**
                 var plugRoomLinkPatt = /(\bhttps?:\/\/(www.)?plug\.dj[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
                 if (plugRoomLinkPatt.exec(msg)) {
                    if (perm === 0) {
                        API.sendChat(subChat(NulledBot.chat.roomadvertising, {name: chat.un}));
                        API.moderateDeleteChat(chat.cid);
                        return true;
                    }
                }
                 **/
                if (msg.indexOf('http://adf.ly/') > -1) {
                    API.moderateDeleteChat(chat.cid);
                    API.sendChat(subChat(NulledBot.chat.adfly, {name: chat.un}));
                    return true;
                }
                if (msg.indexOf('autojoin was not enabled') > 0 || msg.indexOf('AFK message was not enabled') > 0 || msg.indexOf('!afkdisable') > 0 || msg.indexOf('!joindisable') > 0 || msg.indexOf('autojoin disabled') > 0 || msg.indexOf('AFK message disabled') > 0) {
                    API.moderateDeleteChat(chat.cid);
                    return true;
                }

                var rlJoinChat = NulledBot.chat.roulettejoin;
                var rlLeaveChat = NulledBot.chat.rouletteleave;

                var joinedroulette = rlJoinChat.split('%%NAME%%');
                if (joinedroulette[1].length > joinedroulette[0].length) joinedroulette = joinedroulette[1];
                else joinedroulette = joinedroulette[0];

                var leftroulette = rlLeaveChat.split('%%NAME%%');
                if (leftroulette[1].length > leftroulette[0].length) leftroulette = leftroulette[1];
                else leftroulette = leftroulette[0];

                if ((msg.indexOf(joinedroulette) > -1 || msg.indexOf(leftroulette) > -1) && chat.uid === NulledBot.loggedInID) {
                    setTimeout(function (id) {
                        API.moderateDeleteChat(id);
                    }, 5 * 1000, chat.cid);
                    return true;
                }
                return false;
            },
            commandCheck: function (chat) {
                var cmd;
                if (chat.message.charAt(0) === NulledBot.settings.commandLiteral) {
                    var space = chat.message.indexOf(' ');
                    if (space === -1) {
                        cmd = chat.message;
                    }
                    else cmd = chat.message.substring(0, space);
                }
                else return false;
                var userPerm = NulledBot.userUtilities.getPermission(chat.uid);
                //console.log("name: " + chat.un + ", perm: " + userPerm);
                if (chat.message !== NulledBot.settings.commandLiteral + 'join' && chat.message !== NulledBot.settings.commandLiteral + "leave") {
                    if (userPerm === 0 && !NulledBot.room.usercommand) return void (0);
                    if (!NulledBot.room.allcommand) return void (0);
                }
                if (chat.message === NulledBot.settings.commandLiteral + 'eta' && NulledBot.settings.etaRestriction) {
                    if (userPerm < 2) {
                        var u = NulledBot.userUtilities.lookupUser(chat.uid);
                        if (u.lastEta !== null && (Date.now() - u.lastEta) < 1 * 60 * 60 * 1000) {
                            API.moderateDeleteChat(chat.cid);
                            return void (0);
                        }
                        else u.lastEta = Date.now();
                    }
                }
                var executed = false;

                for (var comm in NulledBot.commands) {
                    var cmdCall = NulledBot.commands[comm].command;
                    if (!Array.isArray(cmdCall)) {
                        cmdCall = [cmdCall]
                    }
                    for (var i = 0; i < cmdCall.length; i++) {
                        if (NulledBot.settings.commandLiteral + cmdCall[i] === cmd) {
                            NulledBot.commands[comm].functionality(chat, NulledBot.settings.commandLiteral + cmdCall[i]);
                            executed = true;
                            break;
                        }
                    }
                }

                if (executed && userPerm === 0) {
                    NulledBot.room.usercommand = false;
                    setTimeout(function () {
                        NulledBot.room.usercommand = true;
                    }, NulledBot.settings.commandCooldown * 1000);
                }
                if (executed) {
                    /*if (NulledBot.settings.cmdDeletion) {
                        API.moderateDeleteChat(chat.cid);
                    }*/

                    //NulledBot.room.allcommand = false;
                    //setTimeout(function () {
                        NulledBot.room.allcommand = true;
                    //}, 5 * 1000);
                }
                return executed;
            },
            action: function (chat) {
                var user = NulledBot.userUtilities.lookupUser(chat.uid);
                if (chat.type === 'message') {
                    for (var j = 0; j < NulledBot.room.users.length; j++) {
                        if (NulledBot.userUtilities.getUser(NulledBot.room.users[j]).id === chat.uid) {
                            NulledBot.userUtilities.setLastActivity(NulledBot.room.users[j]);
                        }

                    }
                }
                NulledBot.room.roomstats.chatmessages++;
            },
            spam: [
                'hueh', 'hu3', 'brbr', 'heu', 'brbr', 'kkkk', 'spoder', 'mafia', 'zuera', 'zueira',
                'zueria', 'aehoo', 'aheu', 'alguem', 'algum', 'brazil', 'zoeira', 'fuckadmins', 'affff', 'vaisefoder', 'huenaarea',
                'hitler', 'ashua', 'ahsu', 'ashau', 'lulz', 'huehue', 'hue', 'huehuehue', 'merda', 'pqp', 'puta', 'mulher', 'pula', 'retarda', 'caralho', 'filha', 'ppk',
                'gringo', 'fuder', 'foder', 'hua', 'ahue', 'modafuka', 'modafoka', 'mudafuka', 'mudafoka', 'ooooooooooooooo', 'foda'
            ],
            curses: [
                'nigger', 'faggot', 'nigga', 'niqqa', 'motherfucker', 'modafocka'
            ]
        },
        connectAPI: function () {
            this.proxy = {
                eventChat: $.proxy(this.eventChat, this),
                eventUserskip: $.proxy(this.eventUserskip, this),
                eventUserjoin: $.proxy(this.eventUserjoin, this),
                eventUserleave: $.proxy(this.eventUserleave, this),
                //eventFriendjoin: $.proxy(this.eventFriendjoin, this),
                eventVoteupdate: $.proxy(this.eventVoteupdate, this),
                eventCurateupdate: $.proxy(this.eventCurateupdate, this),
                eventRoomscoreupdate: $.proxy(this.eventRoomscoreupdate, this),
                eventDjadvance: $.proxy(this.eventDjadvance, this),
                //eventDjupdate: $.proxy(this.eventDjupdate, this),
                eventWaitlistupdate: $.proxy(this.eventWaitlistupdate, this),
                eventVoteskip: $.proxy(this.eventVoteskip, this),
                eventModskip: $.proxy(this.eventModskip, this),
                eventChatcommand: $.proxy(this.eventChatcommand, this),
                eventHistoryupdate: $.proxy(this.eventHistoryupdate, this),

            };
            API.on(API.CHAT, this.proxy.eventChat);
            API.on(API.USER_SKIP, this.proxy.eventUserskip);
            API.on(API.USER_JOIN, this.proxy.eventUserjoin);
            API.on(API.USER_LEAVE, this.proxy.eventUserleave);
            API.on(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.on(API.GRAB_UPDATE, this.proxy.eventCurateupdate);
            API.on(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.on(API.ADVANCE, this.proxy.eventDjadvance);
            API.on(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.on(API.MOD_SKIP, this.proxy.eventModskip);
            API.on(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.on(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        disconnectAPI: function () {
            API.off(API.CHAT, this.proxy.eventChat);
            API.off(API.USER_SKIP, this.proxy.eventUserskip);
            API.off(API.USER_JOIN, this.proxy.eventUserjoin);
            API.off(API.USER_LEAVE, this.proxy.eventUserleave);
            API.off(API.VOTE_UPDATE, this.proxy.eventVoteupdate);
            API.off(API.CURATE_UPDATE, this.proxy.eventCurateupdate);
            API.off(API.ROOM_SCORE_UPDATE, this.proxy.eventRoomscoreupdate);
            API.off(API.ADVANCE, this.proxy.eventDjadvance);
            API.off(API.WAIT_LIST_UPDATE, this.proxy.eventWaitlistupdate);
            API.off(API.MOD_SKIP, this.proxy.eventModskip);
            API.off(API.CHAT_COMMAND, this.proxy.eventChatcommand);
            API.off(API.HISTORY_UPDATE, this.proxy.eventHistoryupdate);
        },
        startup: function () {
            Function.prototype.toString = function () {
                return 'Function.'
            };
            var u = API.getUser();
            if (NulledBot.userUtilities.getPermission(u) < 2) return API.chatLog(NulledBot.chat.greyuser);
            if (NulledBot.userUtilities.getPermission(u) === 2) API.chatLog(NulledBot.chat.bouncer);
            NulledBot.connectAPI();
            API.moderateDeleteChat = function (cid) {
                $.ajax({
                    url: "/_/chat/" + cid,
                    type: "DELETE"
                })
            };

            NulledBot.room.name = window.location.pathname;
            var Check;

            console.log(NulledBot.room.name);

            var detect = function(){
                if(NulledBot.room.name != window.location.pathname){
                    console.log("Killing bot after room change.");
                    storeToStorage();
                    NulledBot.disconnectAPI();
                    setTimeout(function () {
                        kill();
                    }, 1000);
                    if (NulledBot.settings.roomLock){
                        window.location = NulledBot.room.name;
                    }
                    else {
                        clearInterval(Check);
                    }
                }
            };

            Check = setInterval(function(){ detect() }, 2000);

            retrieveSettings();
            retrieveFromStorage();
            window.bot = NulledBot;
            NulledBot.roomUtilities.updateBlacklists();
            setInterval(NulledBot.roomUtilities.updateBlacklists, 60 * 60 * 1000);
            NulledBot.getNewBlacklistedSongs = NulledBot.roomUtilities.exportNewBlacklistedSongs;
            NulledBot.logNewBlacklistedSongs = NulledBot.roomUtilities.logNewBlacklistedSongs;
            if (NulledBot.room.roomstats.launchTime === null) {
                NulledBot.room.roomstats.launchTime = Date.now();
            }

            for (var j = 0; j < NulledBot.room.users.length; j++) {
                NulledBot.room.users[j].inRoom = false;
            }
            var userlist = API.getUsers();
            for (var i = 0; i < userlist.length; i++) {
                var known = false;
                var ind = null;
                for (var j = 0; j < NulledBot.room.users.length; j++) {
                    if (NulledBot.room.users[j].id === userlist[i].id) {
                        known = true;
                        ind = j;
                    }
                }
                if (known) {
                    NulledBot.room.users[ind].inRoom = true;
                }
                else {
                    NulledBot.room.users.push(new NulledBot.User(userlist[i].id, userlist[i].username));
                    ind = NulledBot.room.users.length - 1;
                }
                var wlIndex = API.getWaitListPosition(NulledBot.room.users[ind].id) + 1;
                NulledBot.userUtilities.updatePosition(NulledBot.room.users[ind], wlIndex);
            }
            NulledBot.room.afkInterval = setInterval(function () {
                NulledBot.roomUtilities.afkCheck()
            }, 10 * 1000);
            NulledBot.room.autodisableInterval = setInterval(function () {
                NulledBot.room.autodisableFunc();
            }, 60 * 60 * 1000);
            NulledBot.loggedInID = API.getUser().id;
            NulledBot.status = true;
            API.sendChat('/cap ' + NulledBot.settings.startupCap);
            API.setVolume(NulledBot.settings.startupVolume);
            if (NulledBot.settings.autowoot) {
                $("#woot").click();
            }
            if (NulledBot.settings.startupEmoji) {
                var emojibuttonoff = $(".icon-emoji-off");
                if (emojibuttonoff.length > 0) {
                    emojibuttonoff[0].click();
                }
                API.chatLog(':smile: Emojis enabled.');
            }
            else {
                var emojibuttonon = $(".icon-emoji-on");
                if (emojibuttonon.length > 0) {
                    emojibuttonon[0].click();
                }
                API.chatLog('Emojis disabled.');
            }
            API.chatLog('Avatars capped at ' + NulledBot.settings.startupCap);
            API.chatLog('Volume set to ' + NulledBot.settings.startupVolume);
            //socket();
            loadChat(API.sendChat(subChat(NulledBot.chat.online, {botname: NulledBot.settings.botName, version: NulledBot.version})));
        },
        commands: {
            executable: function (minRank, chat) {
                var id = chat.uid;
                var perm = NulledBot.userUtilities.getPermission(id);
                var minPerm;
                switch (minRank) {
                    case 'admin':
                        minPerm = 10;
                        break;
                    case 'ambassador':
                        minPerm = 7;
                        break;
                    case 'host':
                        minPerm = 5;
                        break;
                    case 'cohost':
                        minPerm = 4;
                        break;
                    case 'manager':
                        minPerm = 3;
                        break;
                    case 'mod':
                        if (NulledBot.settings.bouncerPlus) {
                            minPerm = 2;
                        }
                        else {
                            minPerm = 3;
                        }
                        break;
                    case 'bouncer':
                        minPerm = 2;
                        break;
                    case 'residentdj':
                        minPerm = 1;
                        break;
                    case 'user':
                        minPerm = 0;
                        break;
                    default:
                        API.chatLog('error assigning minimum permission');
                }
                return perm >= minPerm;

            },
            /**
             command: {
                        command: 'cmd',
                        rank: 'user/bouncer/mod/manager',
                        type: 'startsWith/exact',
                        functionality: function(chat, cmd){
                                if(this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                                if( !NulledBot.commands.executable(this.rank, chat) ) return void (0);
                                else{

                                }
                        }
                },
             **/

            activeCommand: {
                command: 'active',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var now = Date.now();
                        var chatters = 0;
                        var time;

                        var launchT = NulledBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = durationOnline / 1000;

                        if (msg.length === cmd.length) time = since;
                        else {
                            time = msg.substring(cmd.length + 1);
                            if (isNaN(time)) return API.sendChat(subChat(NulledBot.chat.invalidtime, {name: chat.un}));
                        }
                        for (var i = 0; i < NulledBot.room.users.length; i++) {
                            userTime = NulledBot.userUtilities.getLastActivity(NulledBot.room.users[i]);
                            if ((now - userTime) <= (time * 60 * 1000)) {
                                chatters++;
                            }
                        }
                        API.sendChat(subChat(NulledBot.chat.activeusersintime, {name: chat.un, amount: chatters, time: time}));
                    }
                }
            },

            addCommand: {
                command: 'add',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (msg.length > cmd.length + 2) {
                            if (typeof user !== 'undefined') {
                                if (NulledBot.room.roomevent) {
                                    NulledBot.room.eventArtists.push(user.id);
                                }
                                API.moderateAddDJ(user.id);
                            } else API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        }
                    }
                }
            },

            afklimitCommand: {
                command: 'afklimit',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nolimitspecified, {name: chat.un}));
                        var limit = msg.substring(cmd.length + 1);
                        if (!isNaN(limit)) {
                            NulledBot.settings.maximumAfk = parseInt(limit, 10);
                            API.sendChat(subChat(NulledBot.chat.maximumafktimeset, {name: chat.un, time: NulledBot.settings.maximumAfk}));
                        }
                        else API.sendChat(subChat(NulledBot.chat.invalidlimitspecified, {name: chat.un}));
                    }
                }
            },

            afkremovalCommand: {
                command: 'afkremoval',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.afkRemoval) {
                            NulledBot.settings.afkRemoval = !NulledBot.settings.afkRemoval;
                            clearInterval(NulledBot.room.afkInterval);
                            API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.afkremoval}));
                        }
                        else {
                            NulledBot.settings.afkRemoval = !NulledBot.settings.afkRemoval;
                            NulledBot.room.afkInterval = setInterval(function () {
                                NulledBot.roomUtilities.afkCheck()
                            }, 2 * 1000);
                            API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.afkremoval}));
                        }
                    }
                }
            },

            afkresetCommand: {
                command: 'afkreset',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        NulledBot.userUtilities.setLastActivity(user);
                        API.sendChat(subChat(NulledBot.chat.afkstatusreset, {name: chat.un, username: name}));
                    }
                }
            },

            afktimeCommand: {
                command: 'afktime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var lastActive = NulledBot.userUtilities.getLastActivity(user);
                        var inactivity = Date.now() - lastActive;
                        var time = NulledBot.roomUtilities.msToStr(inactivity);

                        var launchT = NulledBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;

                        if (inactivity == durationOnline){
                            API.sendChat(subChat(NulledBot.chat.inactivelonger, {botname: NulledBot.settings.botName, name: chat.un, username: name}));
                        } else {
                        API.sendChat(subChat(NulledBot.chat.inactivefor, {name: chat.un, username: name, time: time}));
                        }
                    }
                }
            },

            autodisableCommand: {
                command: 'autodisable',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.autodisable) {
                            NulledBot.settings.autodisable = !NulledBot.settings.autodisable;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.autodisable}));
                        }
                        else {
                            NulledBot.settings.autodisable = !NulledBot.settings.autodisable;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.autodisable}));
                        }

                    }
                }
            },

            autoskipCommand: {
                command: 'autoskip',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.autoskip) {
                            NulledBot.settings.autoskip = !NulledBot.settings.autoskip;
                            clearTimeout(NulledBot.room.autoskipTimer);
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.autoskip}));
                        }
                        else {
                            NulledBot.settings.autoskip = !NulledBot.settings.autoskip;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.autoskip}));
                        }
                    }
                }
            },

            autowootCommand: {
                command: 'autowoot',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(NulledBot.chat.autowoot);
                    }
                }
            },

            baCommand: {
                command: 'ba',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(NulledBot.chat.brandambassador);
                    }
                }
            },

            ballCommand: {
                command: ['8ball', 'ask'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                            var crowd = API.getUsers();
                            var msg = chat.message;
                            var argument = msg.substring(cmd.length + 1).replace(/@/g, '');
                            var randomUser = Math.floor(Math.random() * crowd.length);
                            var randomBall = Math.floor(Math.random() * NulledBot.chat.balls.length);
                            var randomSentence = Math.floor(Math.random() * 1);
                            API.sendChat(subChat(NulledBot.chat.ball, {name: chat.un, botname: NulledBot.settings.botName, question: argument, response: NulledBot.chat.balls[randomBall]}));
                     }
                }
            },

            banCommand: {
                command: 'ban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substr(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = NulledBot.userUtilities.getPermission(chat.uid);
                        var permUser = NulledBot.userUtilities.getPermission(user.id);
                        if (permUser >= permFrom) return void(0);
                        API.moderateBanUser(user.id, 1, API.BAN.DAY);
                    }
                }
            },

            blacklistCommand: {
                command: ['blacklist', 'bl'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nolistspecified, {name: chat.un}));
                        var list = msg.substr(cmd.length + 1);
                        if (typeof NulledBot.room.blacklists[list] === 'undefined') return API.sendChat(subChat(NulledBot.chat.invalidlistspecified, {name: chat.un}));
                        else {
                            var media = API.getMedia();
                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var track = {
                                list: list,
                                author: media.author,
                                title: media.title,
                                mid: media.format + ':' + media.cid
                            };
                            NulledBot.room.newBlacklisted.push(track);
                            NulledBot.room.blacklists[list].push(media.format + ':' + media.cid);
                            API.sendChat(subChat(NulledBot.chat.newblacklisted, {name: chat.un, blacklist: list, author: media.author, title: media.title, mid: media.format + ':' + media.cid}));
                            if (NulledBot.settings.smartSkip && timeLeft > timeElapsed){
                                NulledBot.roomUtilities.smartSkip();
                            }
                            else {
                                API.moderateForceSkip();
                            }
                            if (typeof NulledBot.room.newBlacklistedSongFunction === 'function') {
                                NulledBot.room.newBlacklistedSongFunction(track);
                            }
                        }
                    }
                }
            },

            blinfoCommand: {
                command: 'blinfo',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var author = API.getMedia().author;
                        var title = API.getMedia().title;
                        var name = chat.un;
                        var format = API.getMedia().format;
                        var cid = API.getMedia().cid;
                        var songid = format + ":" + cid;

                        API.sendChat(subChat(NulledBot.chat.blinfo, {name: name, author: author, title: title, songid: songid}));
                    }
                }
            },

            bouncerPlusCommand: {
                command: 'bouncer+',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (NulledBot.settings.bouncerPlus) {
                            NulledBot.settings.bouncerPlus = false;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': 'Bouncer+'}));
                        }
                        else {
                            if (!NulledBot.settings.bouncerPlus) {
                                var id = chat.uid;
                                var perm = NulledBot.userUtilities.getPermission(id);
                                if (perm > 2) {
                                    NulledBot.settings.bouncerPlus = true;
                                    return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': 'Bouncer+'}));
                                }
                            }
                            else return API.sendChat(subChat(NulledBot.chat.bouncerplusrank, {name: chat.un}));
                        }
                    }
                }
            },

            botnameCommand: {
                command: 'botname',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(NulledBot.chat.currentbotname, {botname: NulledBot.settings.botName}));
                        var argument = msg.substring(cmd.length + 1);
                        if (argument) {
                            NulledBot.settings.botName = argument;
                            API.sendChat(subChat(NulledBot.chat.botnameset, {botName: NulledBot.settings.botName}));
                        }
                    }
                }
            },

            clearchatCommand: {
                command: 'clearchat',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var currentchat = $('#chat-messages').children();
                        for (var i = 0; i < currentchat.length; i++) {
                            API.moderateDeleteChat(currentchat[i].getAttribute("data-cid"));
                        }
                        return API.sendChat(subChat(NulledBot.chat.chatcleared, {name: chat.un}));
                    }
                }
            },

            clearlocalstorageCommand: {
                command: 'clearlocalstorage',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        localStorage.clear();
                        API.chatLog('Cleared localstorage, please refresh the page!');
                    }
                }
            },

            cmddeletionCommand: {
                command: ['commanddeletion', 'cmddeletion', 'cmddel'],
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.cmdDeletion) {
                            NulledBot.settings.cmdDeletion = !NulledBot.settings.cmdDeletion;
                            API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.cmddeletion}));
                        }
                        else {
                            NulledBot.settings.cmdDeletion = !NulledBot.settings.cmdDeletion;
                            API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.cmddeletion}));
                        }
                    }
                }
            },

            commandsCommand: {
                command: 'commands',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(NulledBot.chat.commandslink, {botname: NulledBot.settings.botName, link: NulledBot.cmdLink}));
                    }
                }
            },

            cookieCommand: {
                command: 'cookie',
                rank: 'user',
                type: 'startsWith',
                getCookie: function (chat) {
                    var c = Math.floor(Math.random() * NulledBot.chat.cookies.length);
                    return NulledBot.chat.cookies[c];
                },
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;

                        var space = msg.indexOf(' ');
                        if (space === -1) {
                            API.sendChat(NulledBot.chat.eatcookie);
                            return false;
                        }
                        else {
                            var name = msg.substring(space + 2);
                            var user = NulledBot.userUtilities.lookupUserName(name);
                            if (user === false || !user.inRoom) {
                                return API.sendChat(subChat(NulledBot.chat.nousercookie, {name: name}));
                            }
                            else if (user.username === chat.un) {
                                return API.sendChat(subChat(NulledBot.chat.selfcookie, {name: name}));
                            }
                            else {
                                return API.sendChat(subChat(NulledBot.chat.cookie, {nameto: user.username, namefrom: chat.un, cookie: this.getCookie()}));
                            }
                        }
                    }
                }
            },

            cycleCommand: {
                command: 'cycle',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        NulledBot.roomUtilities.changeDJCycle();
                    }
                }
            },

            cycleguardCommand: {
                command: 'cycleguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.cycleGuard) {
                            NulledBot.settings.cycleGuard = !NulledBot.settings.cycleGuard;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.cycleguard}));
                        }
                        else {
                            NulledBot.settings.cycleGuard = !NulledBot.settings.cycleGuard;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.cycleguard}));
                        }

                    }
                }
            },

            cycletimerCommand: {
                command: 'cycletimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cycleTime = msg.substring(cmd.length + 1);
                        if (!isNaN(cycleTime) && cycleTime !== "") {
                            NulledBot.settings.maximumCycletime = cycleTime;
                            return API.sendChat(subChat(NulledBot.chat.cycleguardtime, {name: chat.un, time: NulledBot.settings.maximumCycletime}));
                        }
                        else return API.sendChat(subChat(NulledBot.chat.invalidtime, {name: chat.un}));

                    }
                }
            },

            dclookupCommand: {
                command: ['dclookup', 'dc'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substring(cmd.length + 2);
                            var perm = NulledBot.userUtilities.getPermission(chat.uid);
                            if (perm < 2) return API.sendChat(subChat(NulledBot.chat.dclookuprank, {name: chat.un}));
                        }
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var toChat = NulledBot.userUtilities.dclookup(user.id);
                        API.sendChat(toChat);
                    }
                }
            },

            /*

            // This does not work anymore.

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var chats = $('.from');
                        var message = $('.message');
                        var emote = $('.emote');
                        var from = $('.un.clickable');
                        for (var i = 0; i < chats.length; i++) {
                            var n = from[i].textContent;
                            if (name.trim() === n.trim()) {

                                // var messagecid = $(message)[i].getAttribute('data-cid');
                                // var emotecid = $(emote)[i].getAttribute('data-cid');
                                // API.moderateDeleteChat(messagecid);

                                // try {
                                //     API.moderateDeleteChat(messagecid);
                                // }
                                // finally {
                                //     API.moderateDeleteChat(emotecid);
                                // }

                                if (typeof $(message)[i].getAttribute('data-cid') == "undefined"){
                                    API.moderateDeleteChat($(emote)[i].getAttribute('data-cid')); // works well with normal messages but not with emotes due to emotes and messages are seperate.
                                } else {
                                    API.moderateDeleteChat($(message)[i].getAttribute('data-cid'));
                                }
                            }
                        }
                        API.sendChat(subChat(NulledBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },

            */

            deletechatCommand: {
                command: 'deletechat',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        for (var i = 1; i < NulledBot.room.chatMessages.length; i++) {
                          if (NulledBot.room.chatMessages[i].indexOf(user.id) > -1){
                            API.moderateDeleteChat(NulledBot.room.chatMessages[i][0]);
                            NulledBot.room.chatMessages[i].splice(0);
                          }
                        }
                        API.sendChat(subChat(NulledBot.chat.deletechat, {name: chat.un, username: name}));
                    }
                }
            },


            emojiCommand: {
                command: 'emoji',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = 'http://www.emoji-cheat-sheet.com/';
                        API.sendChat(subChat(NulledBot.chat.emojilist, {link: link}));
                    }
                }
            },

            englishCommand: {
                command: 'english',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if(chat.message.length === cmd.length) return API.sendChat('/me No user specified.');
                        var name = chat.message.substring(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if(typeof user === 'boolean') return API.sendChat('/me Invalid user specified.');
                        var lang = NulledBot.userUtilities.getUser(user).language;
                        var ch = '/me @' + name + ' ';
                        switch(lang){
                            case 'en': break;
                            case 'da': ch += 'Vær venlig at tale engelsk.'; break;
                            case 'de': ch += 'Bitte sprechen Sie Englisch.'; break;
                            case 'es': ch += 'Por favor, hable Inglés.'; break;
                            case 'fr': ch += 'Parlez anglais, s\'il vous plaît.'; break;
                            case 'nl': ch += 'Spreek Engels, alstublieft.'; break;
                            case 'pl': ch += 'Proszę mówić po angielsku.'; break;
                            case 'pt': ch += 'Por favor, fale Inglês.'; break;
                            case 'sk': ch += 'Hovorte po anglicky, prosím.'; break;
                            case 'cs': ch += 'Mluvte prosím anglicky.'; break;
                            case 'sr': ch += 'Молим Вас, говорите енглески.'; break;
                        }
                        ch += ' English please.';
                        API.sendChat(ch);
                    }
                }
            },

            etaCommand: {
                command: 'eta',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var perm = NulledBot.userUtilities.getPermission(chat.uid);
                        var msg = chat.message;
                        var dj = API.getDJ().username;
                        var name;
                        if (msg.length > cmd.length) {
                            if (perm < 2) return void (0);
                            name = msg.substring(cmd.length + 2);
                        } else name = chat.un;
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var pos = API.getWaitListPosition(user.id);
                        var realpos = pos + 1;
                        if (name == dj) return API.sendChat(subChat(NulledBot.chat.youaredj, {name: name}));
                        if (pos < 0) return API.sendChat(subChat(NulledBot.chat.notinwaitlist, {name: name}));
                        if (pos == 0) return API.sendChat(subChat(NulledBot.chat.youarenext, {name: name}));
                        var timeRemaining = API.getTimeRemaining();
                        var estimateMS = ((pos + 1) * 4 * 60 + timeRemaining) * 1000;
                        var estimateString = NulledBot.roomUtilities.msToStr(estimateMS);
                        API.sendChat(subChat(NulledBot.chat.eta, {name: name, time: estimateString, position: realpos}));
                    }
                }
            },

            fbCommand: {
                command: 'fb',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof NulledBot.settings.fbLink === "string")
                            API.sendChat(subChat(NulledBot.chat.facebook, {link: NulledBot.settings.fbLink}));
                    }
                }
            },

            filterCommand: {
                command: 'filter',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.filterChat) {
                            NulledBot.settings.filterChat = !NulledBot.settings.filterChat;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.chatfilter}));
                        }
                        else {
                            NulledBot.settings.filterChat = !NulledBot.settings.filterChat;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.chatfilter}));
                        }
                    }
                }
            },

            forceskipCommand: {
                command: ['forceskip', 'fs'],
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(NulledBot.chat.forceskip, {name: chat.un}));
                        API.moderateForceSkip();
                        NulledBot.room.skippable = false;
                        setTimeout(function () {
                            NulledBot.room.skippable = true
                        }, 5 * 1000);

                    }
                }
            },

            ghostbusterCommand: {
                command: 'ghostbuster',
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (user === false || !user.inRoom) {
                            return API.sendChat(subChat(NulledBot.chat.ghosting, {name1: chat.un, name2: name}));
                        }
                        else API.sendChat(subChat(NulledBot.chat.notghosting, {name1: chat.un, name2: name}));
                    }
                }
            },

            gifCommand: {
                command: ['gif', 'giphy'],
                rank: 'user',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length !== cmd.length) {
                            function get_id(api_key, fixedtag, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating,
                                        "tag": fixedtag
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            var tag = msg.substr(cmd.length + 1);
                            var fixedtag = tag.replace(/ /g,"+");
                            var commatag = tag.replace(/ /g,", ");
                            get_id(api_key, tag, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(NulledBot.chat.validgiftags, {name: chat.un, id: id, tags: commatag}));
                                } else {
                                    API.sendChat(subChat(NulledBot.chat.invalidgiftags, {name: chat.un, tags: commatag}));
                                }
                            });
                        }
                        else {
                            function get_random_id(api_key, func)
                            {
                                $.getJSON(
                                    "https://tv.giphy.com/v1/gifs/random?",
                                    {
                                        "format": "json",
                                        "api_key": api_key,
                                        "rating": rating
                                    },
                                    function(response)
                                    {
                                        func(response.data.id);
                                    }
                                    )
                            }
                            var api_key = "dc6zaTOxFJmzC"; // public beta key
                            var rating = "pg-13"; // PG 13 gifs
                            get_random_id(api_key, function(id) {
                                if (typeof id !== 'undefined') {
                                    API.sendChat(subChat(NulledBot.chat.validgifrandom, {name: chat.un, id: id}));
                                } else {
                                    API.sendChat(subChat(NulledBot.chat.invalidgifrandom, {name: chat.un}));
                                }
                            });
                        }
                    }
                }
            },

            helpCommand: {
                command: 'help',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var link = "(Updated link coming soon)";
                        API.sendChat(subChat(NulledBot.chat.starterhelp, {link: link}));
                    }
                }
            },

            historyskipCommand: {
                command: 'historyskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.historySkip) {
                            NulledBot.settings.historySkip = !NulledBot.settings.historySkip;
                            API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.historyskip}));
                        }
                        else {
                            NulledBot.settings.historySkip = !NulledBot.settings.historySkip;
                            API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.historyskip}));
                        }
                    }
                }
            },

            joinCommand: {
                command: 'join',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.room.roulette.rouletteStatus && NulledBot.room.roulette.participants.indexOf(chat.uid) < 0) {
                            NulledBot.room.roulette.participants.push(chat.uid);
                            API.sendChat(subChat(NulledBot.chat.roulettejoin, {name: chat.un}));
                        }
                    }
                }
            },

            jointimeCommand: {
                command: 'jointime',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var join = NulledBot.userUtilities.getJointime(user);
                        var time = Date.now() - join;
                        var timeString = NulledBot.roomUtilities.msToStr(time);
                        API.sendChat(subChat(NulledBot.chat.jointime, {namefrom: chat.un, username: name, time: timeString}));
                    }
                }
            },

            kickCommand: {
                command: 'kick',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lastSpace = msg.lastIndexOf(' ');
                        var time;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            time = 0.25;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            time = msg.substring(lastSpace + 1);
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }

                        var user = NulledBot.userUtilities.lookupUserName(name);
                        var from = chat.un;
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));

                        var permFrom = NulledBot.userUtilities.getPermission(chat.uid);
                        var permTokick = NulledBot.userUtilities.getPermission(user.id);

                        if (permFrom <= permTokick)
                            return API.sendChat(subChat(NulledBot.chat.kickrank, {name: chat.un}));

                        if (!isNaN(time)) {
                            API.sendChat(subChat(NulledBot.chat.kick, {name: chat.un, username: name, time: time}));
                            if (time > 24 * 60 * 60) API.moderateBanUser(user.id, 1, API.BAN.PERMA);
                            else API.moderateBanUser(user.id, 1, API.BAN.DAY);
                            setTimeout(function (id, name) {
                                API.moderateUnbanUser(id);
                                console.log('Unbanned @' + name + '. (' + id + ')');
                            }, time * 60 * 1000, user.id, name);
                        }
                        else API.sendChat(subChat(NulledBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            killCommand: {
                command: 'kill',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        storeToStorage();
                        //sendToSocket();
                        API.sendChat(NulledBot.chat.kill);
                        NulledBot.disconnectAPI();
                        setTimeout(function () {
                            kill();
                        }, 1000);
                    }
                }
            },

            languageCommand: {
                command: 'language',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(NulledBot.chat.currentlang, {language: NulledBot.settings.language}));
                        var argument = msg.substring(cmd.length + 1);

                        $.get("https://rawgit.com/NulledBot/source/master/lang/langIndex.json", function (json) {
                            var langIndex = json;
                            var link = langIndex[argument.toLowerCase()];
                            if (typeof link === "undefined") {
                                API.sendChat(subChat(NulledBot.chat.langerror, {link: "http://git.io/vJ9nI"}));
                            }
                            else {
                                NulledBot.settings.language = argument;
                                loadChat();
                                API.sendChat(subChat(NulledBot.chat.langset, {language: NulledBot.settings.language}));
                            }
                        });
                    }
                }
            },

            leaveCommand: {
                command: 'leave',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var ind = NulledBot.room.roulette.participants.indexOf(chat.uid);
                        if (ind > -1) {
                            NulledBot.room.roulette.participants.splice(ind, 1);
                            API.sendChat(subChat(NulledBot.chat.rouletteleave, {name: chat.un}));
                        }
                    }
                }
            },

            linkCommand: {
                command: 'link',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var media = API.getMedia();
                        var from = chat.un;
                        var user = NulledBot.userUtilities.lookupUser(chat.uid);
                        var perm = NulledBot.userUtilities.getPermission(chat.uid);
                        var dj = API.getDJ().id;
                        var isDj = false;
                        if (dj === chat.uid) isDj = true;
                        if (perm >= 1 || isDj) {
                            if (media.format === 1) {
                                var linkToSong = "https://youtu.be/" + media.cid;
                                API.sendChat(subChat(NulledBot.chat.songlink, {name: from, link: linkToSong}));
                            }
                            if (media.format === 2) {
                                SC.get('/tracks/' + media.cid, function (sound) {
                                    API.sendChat(subChat(NulledBot.chat.songlink, {name: from, link: sound.permalink_url}));
                                });
                            }
                        }
                    }
                }
            },

            lockCommand: {
                command: 'lock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        NulledBot.roomUtilities.booth.lockBooth();
                    }
                }
            },

            lockdownCommand: {
                command: 'lockdown',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = NulledBot.settings.lockdownEnabled;
                        NulledBot.settings.lockdownEnabled = !temp;
                        if (NulledBot.settings.lockdownEnabled) {
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.lockdown}));
                        }
                        else return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.lockdown}));
                    }
                }
            },

            lockguardCommand: {
                command: 'lockguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.lockGuard) {
                            NulledBot.settings.lockGuard = !NulledBot.settings.lockGuard;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.lockguard}));
                        }
                        else {
                            NulledBot.settings.lockGuard = !NulledBot.settings.lockGuard;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.lockguard}));
                        }
                    }
                }
            },

            lockskipCommand: {
                command: 'lockskip',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.room.skippable) {
                            var dj = API.getDJ();
                            var id = dj.id;
                            var name = dj.username;
                            var msgSend = '@' + name + ': ';
                            NulledBot.room.queueable = false;

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(NulledBot.chat.usedlockskip, {name: chat.un}));
                                NulledBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    NulledBot.room.skippable = false;
                                    setTimeout(function () {
                                        NulledBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        NulledBot.userUtilities.moveUser(id, NulledBot.settings.lockskipPosition, false);
                                        NulledBot.room.queueable = true;
                                        setTimeout(function () {
                                            NulledBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < NulledBot.settings.lockskipReasons.length; i++) {
                                var r = NulledBot.settings.lockskipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += NulledBot.settings.lockskipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(NulledBot.chat.usedlockskip, {name: chat.un}));
                                NulledBot.roomUtilities.booth.lockBooth();
                                setTimeout(function (id) {
                                    API.moderateForceSkip();
                                    NulledBot.room.skippable = false;
                                    API.sendChat(msgSend);
                                    setTimeout(function () {
                                        NulledBot.room.skippable = true
                                    }, 5 * 1000);
                                    setTimeout(function (id) {
                                        NulledBot.userUtilities.moveUser(id, NulledBot.settings.lockskipPosition, false);
                                        NulledBot.room.queueable = true;
                                        setTimeout(function () {
                                            NulledBot.roomUtilities.booth.unlockBooth();
                                        }, 1000);
                                    }, 1500, id);
                                }, 1000, id);
                                return void (0);
                            }
                        }
                    }
                }
            },

            locktimerCommand: {
                command: 'locktimer',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var lockTime = msg.substring(cmd.length + 1);
                        if (!isNaN(lockTime) && lockTime !== "") {
                            NulledBot.settings.maximumLocktime = lockTime;
                            return API.sendChat(subChat(NulledBot.chat.lockguardtime, {name: chat.un, time: NulledBot.settings.maximumLocktime}));
                        }
                        else return API.sendChat(subChat(NulledBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            logoutCommand: {
                command: 'logout',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(subChat(NulledBot.chat.logout, {name: chat.un, botname: NulledBot.settings.botName}));
                        setTimeout(function () {
                            $(".logout").mousedown()
                        }, 1000);
                    }
                }
            },

            maxlengthCommand: {
                command: 'maxlength',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var maxTime = msg.substring(cmd.length + 1);
                        if (!isNaN(maxTime)) {
                            NulledBot.settings.maximumSongLength = maxTime;
                            return API.sendChat(subChat(NulledBot.chat.maxlengthtime, {name: chat.un, time: NulledBot.settings.maximumSongLength}));
                        }
                        else return API.sendChat(subChat(NulledBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            motdCommand: {
                command: 'motd',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat('/me MotD: ' + NulledBot.settings.motd);
                        var argument = msg.substring(cmd.length + 1);
                        if (!NulledBot.settings.motdEnabled) NulledBot.settings.motdEnabled = !NulledBot.settings.motdEnabled;
                        if (isNaN(argument)) {
                            NulledBot.settings.motd = argument;
                            API.sendChat(subChat(NulledBot.chat.motdset, {msg: NulledBot.settings.motd}));
                        }
                        else {
                            NulledBot.settings.motdInterval = argument;
                            API.sendChat(subChat(NulledBot.chat.motdintervalset, {interval: NulledBot.settings.motdInterval}));
                        }
                    }
                }
            },

            moveCommand: {
                command: 'move',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var pos;
                        var name;
                        if (isNaN(parseInt(msg.substring(lastSpace + 1)))) {
                            pos = 1;
                            name = msg.substring(cmd.length + 2);
                        }
                        else {
                            pos = parseInt(msg.substring(lastSpace + 1));
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        if (user.id === NulledBot.loggedInID) return API.sendChat(subChat(NulledBot.chat.addbotwaitlist, {name: chat.un}));
                        if (!isNaN(pos)) {
                            API.sendChat(subChat(NulledBot.chat.move, {name: chat.un}));
                            NulledBot.userUtilities.moveUser(user.id, pos, false);
                        } else return API.sendChat(subChat(NulledBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            muteCommand: {
                command: 'mute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var lastSpace = msg.lastIndexOf(' ');
                        var time = null;
                        var name;
                        if (lastSpace === msg.indexOf(' ')) {
                            name = msg.substring(cmd.length + 2);
                            time = 45;
                        } else {
                            time = msg.substring(lastSpace + 1);
                            if (isNaN(time) || time == '' || time == null || typeof time == 'undefined'){
                                return API.sendChat(subChat(NulledBot.chat.invalidtime, {name: chat.un}));
                            }
                            name = msg.substring(cmd.length + 2, lastSpace);
                        }
                        var from = chat.un;
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (typeof user === 'boolean') return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var permFrom = NulledBot.userUtilities.getPermission(chat.uid);
                        var permUser = NulledBot.userUtilities.getPermission(user.id);
                        if (permUser == 0) {
                            if (time > 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(NulledBot.chat.mutedmaxtime, {name: chat.un, time: '45'}));
                            }
                            else if (time === 45) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(NulledBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                            else if (time > 30) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.LONG);
                                API.sendChat(subChat(NulledBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                            else if (time > 15) {
                                API.moderateMuteUser(user.id, 1, API.MUTE.MEDIUM);
                                API.sendChat(subChat(NulledBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                            else {
                                API.moderateMuteUser(user.id, 1, API.MUTE.SHORT);
                                API.sendChat(subChat(NulledBot.chat.mutedtime, {name: chat.un, username: name, time: time}));
                            }
                        }
                        else API.sendChat(subChat(NulledBot.chat.muterank, {name: chat.un}));
                    }
                }
            },

            opCommand: {
                command: 'op',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof NulledBot.settings.opLink === "string")
                            return API.sendChat(subChat(NulledBot.chat.oplist, {link: NulledBot.settings.opLink}));
                    }
                }
            },

            pingCommand: {
                command: 'ping',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(NulledBot.chat.pong)
                    }
                }
            },

            refreshCommand: {
                command: 'refresh',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        //sendToSocket();
                        storeToStorage();
                        NulledBot.disconnectAPI();
                        setTimeout(function () {
                            window.location.reload(false);
                        }, 1000);

                    }
                }
            },

            reloadCommand: {
                command: 'reload',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat(NulledBot.chat.reload);
                        //sendToSocket();
                        storeToStorage();
                        NulledBot.disconnectAPI();
                        kill();
                        setTimeout(function () {
                            $.getScript(NulledBot.settings.scriptLink);
                        }, 2000);
                    }
                }
            },

            removeCommand: {
                command: 'remove',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length > cmd.length + 2) {
                            var name = msg.substr(cmd.length + 2);
                            var user = NulledBot.userUtilities.lookupUserName(name);
                            if (typeof user !== 'boolean') {
                                user.lastDC = {
                                    time: null,
                                    position: null,
                                    songCount: 0
                                };
                                if (API.getDJ().id === user.id) {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.moderateRemoveDJ(user.id);
                                    }, 1 * 1000, user);
                                }
                                else API.moderateRemoveDJ(user.id);
                            } else API.sendChat(subChat(NulledBot.chat.removenotinwl, {name: chat.un, username: name}));
                        } else API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                    }
                }
            },

            restrictetaCommand: {
                command: 'restricteta',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.etaRestriction) {
                            NulledBot.settings.etaRestriction = !NulledBot.settings.etaRestriction;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.etarestriction}));
                        }
                        else {
                            NulledBot.settings.etaRestriction = !NulledBot.settings.etaRestriction;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.etarestriction}));
                        }
                    }
                }
            },

            rouletteCommand: {
                command: 'roulette',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (!NulledBot.room.roulette.rouletteStatus) {
                            NulledBot.room.roulette.startRoulette();
                        }
                    }
                }
            },

            rulesCommand: {
                command: 'rules',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof NulledBot.settings.rulesLink === "string")
                            return API.sendChat(subChat(NulledBot.chat.roomrules, {link: NulledBot.settings.rulesLink}));
                    }
                }
            },

            sessionstatsCommand: {
                command: 'sessionstats',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var woots = NulledBot.room.roomstats.totalWoots;
                        var mehs = NulledBot.room.roomstats.totalMehs;
                        var grabs = NulledBot.room.roomstats.totalCurates;
                        API.sendChat(subChat(NulledBot.chat.sessionstats, {name: from, woots: woots, mehs: mehs, grabs: grabs}));
                    }
                }
            },

            skipCommand: {
                command: ['skip', 'smartskip'],
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.room.skippable) {

                            var timeLeft = API.getTimeRemaining();
                            var timeElapsed = API.getTimeElapsed();
                            var dj = API.getDJ();
                            var name = dj.username;
                            var msgSend = '@' + name + ', ';

                            if (chat.message.length === cmd.length) {
                                API.sendChat(subChat(NulledBot.chat.usedskip, {name: chat.un}));
                                if (NulledBot.settings.smartSkip && timeLeft > timeElapsed){
                                    NulledBot.roomUtilities.smartSkip();
                                }
                                else {
                                    API.moderateForceSkip();
                                }
                            }
                            var validReason = false;
                            var msg = chat.message;
                            var reason = msg.substring(cmd.length + 1);
                            for (var i = 0; i < NulledBot.settings.skipReasons.length; i++) {
                                var r = NulledBot.settings.skipReasons[i][0];
                                if (reason.indexOf(r) !== -1) {
                                    validReason = true;
                                    msgSend += NulledBot.settings.skipReasons[i][1];
                                }
                            }
                            if (validReason) {
                                API.sendChat(subChat(NulledBot.chat.usedskip, {name: chat.un}));
                                if (NulledBot.settings.smartSkip && timeLeft > timeElapsed){
                                    NulledBot.roomUtilities.smartSkip(msgSend);
                                }
                                else {
                                    API.moderateForceSkip();
                                    setTimeout(function () {
                                        API.sendChat(msgSend);
                                    }, 500);
                                }
                            }
                        }
                    }
                }
            },

            skipposCommand: {
                command: 'skippos',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var pos = msg.substring(cmd.length + 1);
                        if (!isNaN(pos)) {
                            NulledBot.settings.skipPosition = pos;
                            return API.sendChat(subChat(NulledBot.chat.skippos, {name: chat.un, position: NulledBot.settings.skipPosition}));
                        }
                        else return API.sendChat(subChat(NulledBot.chat.invalidpositionspecified, {name: chat.un}));
                    }
                }
            },

            songstatsCommand: {
                command: 'songstats',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.songstats) {
                            NulledBot.settings.songstats = !NulledBot.settings.songstats;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.songstats}));
                        }
                        else {
                            NulledBot.settings.songstats = !NulledBot.settings.songstats;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.songstats}));
                        }
                    }
                }
            },

            sourceCommand: {
                command: 'source',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        API.sendChat('/me This bot was created by ' + botCreator + ', but is now maintained by ' + botMaintainer + ".");
                    }
                }
            },

            statusCommand: {
                command: 'status',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var from = chat.un;
                        var msg = '[@' + from + '] ';

                        msg += NulledBot.chat.afkremoval + ': ';
                        if (NulledBot.settings.afkRemoval) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';
                        msg += NulledBot.chat.afksremoved + ": " + NulledBot.room.afkList.length + '. ';
                        msg += NulledBot.chat.afklimit + ': ' + NulledBot.settings.maximumAfk + '. ';

                        msg += 'Bouncer+: ';
                        if (NulledBot.settings.bouncerPlus) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.blacklist + ': ';
                        if (NulledBot.settings.blacklistEnabled) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.lockguard + ': ';
                        if (NulledBot.settings.lockGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.cycleguard + ': ';
                        if (NulledBot.settings.cycleGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.timeguard + ': ';
                        if (NulledBot.settings.timeGuard) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.chatfilter + ': ';
                        if (NulledBot.settings.filterChat) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.historyskip + ': ';
                        if (NulledBot.settings.historySkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.voteskip + ': ';
                        if (NulledBot.settings.voteSkip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.cmddeletion + ': ';
                        if (NulledBot.settings.cmdDeletion) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        msg += NulledBot.chat.autoskip + ': ';
                        if (NulledBot.settings.autoskip) msg += 'ON';
                        else msg += 'OFF';
                        msg += '. ';

                        // TODO: Display more toggleable bot settings.

                        var launchT = NulledBot.room.roomstats.launchTime;
                        var durationOnline = Date.now() - launchT;
                        var since = NulledBot.roomUtilities.msToStr(durationOnline);
                        msg += subChat(NulledBot.chat.activefor, {time: since});

                        /*
                        // least efficient way to go about this, but it works :)
                        if (msg.length > 250){
                            firstpart = msg.substr(0, 250);
                            secondpart = msg.substr(250);
                            API.sendChat(firstpart);
                            setTimeout(function () {
                                API.sendChat(secondpart);
                            }, 300);
                        }
                        else {
                            API.sendChat(msg);
                        }
                        */

                        // This is a more efficient solution
                        if (msg.length > 250){
                            var split = msg.match(/.{1,250}/g);
                            for (var i = 0; i < split.length; i++) {
                                var func = function(index) {
                                    setTimeout(function() {
                                        API.sendChat("/me " + split[index]);
                                    }, 500 * index);
                                }
                                func(i);
                            }
                        }
                        else {
                            return API.sendChat(msg);
                        }
                    }
                }
            },

            swapCommand: {
                command: 'swap',
                rank: 'mod',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var firstSpace = msg.indexOf(' ');
                        var lastSpace = msg.lastIndexOf(' ');
                        var name1 = msg.split('@')[1].trim();
                        var name2 = msg.split('@')[2].trim();
                        var user1 = NulledBot.userUtilities.lookupUserName(name1);
                        var user2 = NulledBot.userUtilities.lookupUserName(name2);
                        if (typeof user1 === 'boolean' || typeof user2 === 'boolean') return API.sendChat(subChat(NulledBot.chat.swapinvalid, {name: chat.un}));
                        if (user1.id === NulledBot.loggedInID || user2.id === NulledBot.loggedInID) return API.sendChat(subChat(NulledBot.chat.addbottowaitlist, {name: chat.un}));
                        var p1 = API.getWaitListPosition(user1.id) + 1;
                        var p2 = API.getWaitListPosition(user2.id) + 1;
                        if (p1 < 0 && p2 < 0) return API.sendChat(subChat(NulledBot.chat.swapwlonly, {name: chat.un}));
                        API.sendChat(subChat(NulledBot.chat.swapping, {'name1': name1, 'name2': name2}));
                        if (p1 === -1){
                            API.moderateRemoveDJ(user2.id);
                            setTimeout(function (user1, p2) {
                                NulledBot.userUtilities.moveUser(user1.id, p2, true);
                            }, 2000, user1, p2);
                        }
                        else if (p2 === -1){
                            API.moderateRemoveDJ(user1.id);
                            setTimeout(function (user2, p1) {
                                NulledBot.userUtilities.moveUser(user2.id, p1, true);
                            }, 2000, user2, p1);
                        }
                        else if (p1 < p2) {
                            NulledBot.userUtilities.moveUser(user2.id, p1, false);
                            setTimeout(function (user1, p2) {
                                NulledBot.userUtilities.moveUser(user1.id, p2, false);
                            }, 2000, user1, p2);
                        }
                        else {
                            NulledBot.userUtilities.moveUser(user1.id, p2, false);
                            setTimeout(function (user2, p1) {
                                NulledBot.userUtilities.moveUser(user2.id, p1, false);
                            }, 2000, user2, p1);
                        }
                    }
                }
            },

            themeCommand: {
                command: 'theme',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof NulledBot.settings.themeLink === "string")
                            API.sendChat(subChat(NulledBot.chat.genres, {link: NulledBot.settings.themeLink}));
                    }
                }
            },

            thorCommand: {
              command: 'thor',
              rank: 'user',
              type: 'exact',
              functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                      if (NulledBot.settings.thorCommand){
                        var id = chat.uid,
                              isDj = API.getDJ().id == id ? true : false,
                              from = chat.un,
                              djlist = API.getWaitList(),
                              inDjList = false,
                              oldTime = 0,
                              usedThor = false,
                              indexArrUsedThor,
                              thorCd = false,
                              timeInMinutes = 0,
                              worthyAlg = Math.floor(Math.random() * 10),
                              worthy = worthyAlg == 10 ? true : false;

                          for (var i = 0; i < djlist.length; i++) {
                              if (djlist[i].id == id)
                                  inDjList = true;
                          }

                          if (inDjList) {
                              for (var i = 0; i < NulledBot.room.usersUsedThor.length; i++) {
                                  if (NulledBot.room.usersUsedThor[i].id == id) {
                                      oldTime = NulledBot.room.usersUsedThor[i].time;
                                      usedThor = true;
                                      indexArrUsedThor = i;
                                  }
                              }

                              if (usedThor) {
                                  timeInMinutes = (NulledBot.settings.thorCooldown + 1) - (Math.floor((oldTime - Date.now()) * Math.pow(10, -5)) * -1);
                                  thorCd = timeInMinutes > 0 ? true : false;
                                  if (thorCd == false)
                                      NulledBot.room.usersUsedThor.splice(indexArrUsedThor, 1);
                              }

                              if (thorCd == false || usedThor == false) {
                                  var user = {id: id, time: Date.now()};
                                  NulledBot.room.usersUsedThor.push(user);
                              }
                          }

                          if (!inDjList) {
                              return API.sendChat(subChat(NulledBot.chat.thorNotClose, {name: from}));
                          } else if (thorCd) {
                              return API.sendChat(subChat(NulledBot.chat.thorcd, {name: from, time: timeInMinutes}));
                          }

                          if (worthy) {
                            if (API.getWaitListPosition(id) != 0)
                            NulledBot.userUtilities.moveUser(id, 1, false);
                            API.sendChat(subChat(NulledBot.chat.thorWorthy, {name: from}));
                          } else {
                            if (API.getWaitListPosition(id) != djlist.length - 1)
                            NulledBot.userUtilities.moveUser(id, djlist.length, false);
                            API.sendChat(subChat(NulledBot.chat.thorNotWorthy, {name: from}));
                          }
                        }
                    }
                }
            },

            timeguardCommand: {
                command: 'timeguard',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.timeGuard) {
                            NulledBot.settings.timeGuard = !NulledBot.settings.timeGuard;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.timeguard}));
                        }
                        else {
                            NulledBot.settings.timeGuard = !NulledBot.settings.timeGuard;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.timeguard}));
                        }

                    }
                }
            },

            toggleblCommand: {
                command: 'togglebl',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var temp = NulledBot.settings.blacklistEnabled;
                        NulledBot.settings.blacklistEnabled = !temp;
                        if (NulledBot.settings.blacklistEnabled) {
                          return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.blacklist}));
                        }
                        else return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.blacklist}));
                    }
                }
            },

            togglemotdCommand: {
                command: 'togglemotd',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.motdEnabled) {
                            NulledBot.settings.motdEnabled = !NulledBot.settings.motdEnabled;
                            API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.motd}));
                        }
                        else {
                            NulledBot.settings.motdEnabled = !NulledBot.settings.motdEnabled;
                            API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.motd}));
                        }
                    }
                }
            },

            togglevoteskipCommand: {
                command: 'togglevoteskip',
                rank: 'bouncer',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.voteSkip) {
                            NulledBot.settings.voteSkip = !NulledBot.settings.voteSkip;
                            API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.voteskip}));
                        }
                        else {
                            NulledBot.settings.voteSkip = !NulledBot.settings.voteSkip;
                            API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.voteskip}));
                        }
                    }
                }
            },

            unbanCommand: {
                command: 'unban',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $.getJSON('/_/bans', function (json){
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length + 2);
                            var bannedUsers = json.data;
                            var found = false;
                            var bannedUser = null;
                            for (var i = 0; i < bannedUsers.length; i++) {
                                var user = bannedUsers[i];
                                if (user.username === name) {
                                    bannedUser = user;
                                    found = true;
                                }
                            }
                            if (!found) return API.sendChat(subChat(NulledBot.chat.notbanned, {name: chat.un}));
                            API.moderateUnbanUser(bannedUser.id);
                            console.log('Unbanned:', name);
                        });
                    }
                }
            },

            unlockCommand: {
                command: 'unlock',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        NulledBot.roomUtilities.booth.unlockBooth();
                    }
                }
            },

            unmuteCommand: {
                command: 'unmute',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        $.getJSON('/_/mutes', function (json){
                            var msg = chat.message;
                            if (msg.length === cmd.length) return;
                            var name = msg.substring(cmd.length+2);
                            var arg = msg.substring(cmd.length+1);
                            var mutedUsers = json.data;
                            var found = false;
                            var mutedUser = null;
                            var permFrom = NulledBot.userUtilities.getPermission(chat.uid);
                            if (msg.indexOf('@') === -1 && arg === 'all'){
                                if (permFrom > 2){
                                    for (var i = 0; i < mutedUsers.length; i++){
                                        API.moderateUnmuteUser(mutedUsers[i].id);
                                    }
                                    API.sendChat(subChat(NulledBot.chat.unmutedeveryone, {name: chat.un}));
                                } else API.sendChat(subChat(NulledBot.chat.unmuteeveryonerank, {name: chat.un}));
                            } else {
                                for (var i = 0; i < mutedUsers.length; i++){
                                    var user = mutedUsers[i];
                                    if (user.username === name){
                                        mutedUser = user;
                                        found = true;
                                    }
                                }
                                if (!found) return API.sendChat(subChat(NulledBot.chat.notbanned, {name: chat.un}));
                                API.moderateUnmuteUser(mutedUser.id);
                                console.log('Unmuted:', name);
                            }
                        });
                    }
                }
            },

            usercmdcdCommand: {
                command: 'usercmdcd',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var cd = msg.substring(cmd.length + 1);
                        if (!isNaN(cd)) {
                            NulledBot.settings.commandCooldown = cd;
                            return API.sendChat(subChat(NulledBot.chat.commandscd, {name: chat.un, time: NulledBot.settings.commandCooldown}));
                        }
                        else return API.sendChat(subChat(NulledBot.chat.invalidtime, {name: chat.un}));
                    }
                }
            },

            usercommandsCommand: {
                command: 'usercommands',
                rank: 'manager',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.usercommandsEnabled) {
                            API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.usercommands}));
                            NulledBot.settings.usercommandsEnabled = !NulledBot.settings.usercommandsEnabled;
                        }
                        else {
                            API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.usercommands}));
                            NulledBot.settings.usercommandsEnabled = !NulledBot.settings.usercommandsEnabled;
                        }
                    }
                }
            },

            voteratioCommand: {
                command: 'voteratio',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length === cmd.length) return API.sendChat(subChat(NulledBot.chat.nouserspecified, {name: chat.un}));
                        var name = msg.substring(cmd.length + 2);
                        var user = NulledBot.userUtilities.lookupUserName(name);
                        if (user === false) return API.sendChat(subChat(NulledBot.chat.invaliduserspecified, {name: chat.un}));
                        var vratio = user.votes;
                        var ratio = vratio.woot / vratio.meh;
                        API.sendChat(subChat(NulledBot.chat.voteratio, {name: chat.un, username: name, woot: vratio.woot, mehs: vratio.meh, ratio: ratio.toFixed(2)}));
                    }
                }
            },

            voteskipCommand: {
                command: 'voteskip',
                rank: 'manager',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        if (msg.length <= cmd.length + 1) return API.sendChat(subChat(NulledBot.chat.voteskiplimit, {name: chat.un, limit: NulledBot.settings.voteSkipLimit}));
                        var argument = msg.substring(cmd.length + 1);
                        if (!NulledBot.settings.voteSkip) NulledBot.settings.voteSkip = !NulledBot.settings.voteSkip;
                        if (isNaN(argument)) {
                            API.sendChat(subChat(NulledBot.chat.voteskipinvalidlimit, {name: chat.un}));
                        }
                        else {
                            NulledBot.settings.voteSkipLimit = argument;
                            API.sendChat(subChat(NulledBot.chat.voteskipsetlimit, {name: chat.un, limit: NulledBot.settings.voteSkipLimit}));
                        }
                    }
                }
            },

            welcomeCommand: {
                command: 'welcome',
                rank: 'mod',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (NulledBot.settings.welcome) {
                            NulledBot.settings.welcome = !NulledBot.settings.welcome;
                            return API.sendChat(subChat(NulledBot.chat.toggleoff, {name: chat.un, 'function': NulledBot.chat.welcomemsg}));
                        }
                        else {
                            NulledBot.settings.welcome = !NulledBot.settings.welcome;
                            return API.sendChat(subChat(NulledBot.chat.toggleon, {name: chat.un, 'function': NulledBot.chat.welcomemsg}));
                        }
                    }
                }
            },

            websiteCommand: {
                command: 'website',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof NulledBot.settings.website === "string")
                            API.sendChat(subChat(NulledBot.chat.website, {link: NulledBot.settings.website}));
                    }
                }
            },

            whoisCommand: {
                command: 'whois',
                rank: 'bouncer',
                type: 'startsWith',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        var msg = chat.message;
                        var name;
                        if (msg.length === cmd.length) name = chat.un;
                        else {
                            name = msg.substr(cmd.length + 2);
                        }
                        users = API.getUsers();
                        var len = users.length;
                        for (var i = 0; i < len; ++i){
                            if (users[i].username == name){
                                var id = users[i].id;
                                var avatar = API.getUser(id).avatarID;
                                var level = API.getUser(id).level;
                                var rawjoined = API.getUser(id).joined;
                                var joined = rawjoined.substr(0, 10);
                                var rawlang = API.getUser(id).language;
                                if (rawlang == "en"){
                                    var language = "English";
                                } else if (rawlang == "bg"){
                                    var language = "Bulgarian";
                                } else if (rawlang == "cs"){
                                    var language = "Czech";
                                } else if (rawlang == "fi"){
                                    var language = "Finnish"
                                } else if (rawlang == "fr"){
                                    var language = "French"
                                } else if (rawlang == "pt"){
                                    var language = "Portuguese"
                                } else if (rawlang == "zh"){
                                    var language = "Chinese"
                                } else if (rawlang == "sk"){
                                    var language = "Slovak"
                                } else if (rawlang == "nl"){
                                    var language = "Dutch"
                                } else if (rawlang == "ms"){
                                    var language = "Malay"
                                }
                                var rawrank = API.getUser(id).role;
                                if (rawrank == "0"){
                                    var rank = "User";
                                } else if (rawrank == "1"){
                                    var rank = "Resident DJ";
                                } else if (rawrank == "2"){
                                    var rank = "Bouncer";
                                } else if (rawrank == "3"){
                                    var rank = "Manager"
                                } else if (rawrank == "4"){
                                    var rank = "Co-Host"
                                } else if (rawrank == "5"){
                                    var rank = "Host"
                                } else if (rawrank == "7"){
                                    var rank = "Brand Ambassador"
                                } else if (rawrank == "10"){
                                    var rank = "Admin"
                                }
                                var slug = API.getUser(id).slug;
                                if (typeof slug !== 'undefined') {
                                    var profile = "https://plug.dj/@/" + slug;
                                } else {
                                    var profile = "~";
                                }

                                API.sendChat(subChat(NulledBot.chat.whois, {name1: chat.un, name2: name, id: id, avatar: avatar, profile: profile, language: language, level: level, joined: joined, rank: rank}));
                            }
                        }
                    }
                }
            },

            youtubeCommand: {
                command: 'youtube',
                rank: 'user',
                type: 'exact',
                functionality: function (chat, cmd) {
                    if (this.type === 'exact' && chat.message.length !== cmd.length) return void (0);
                    if (!NulledBot.commands.executable(this.rank, chat)) return void (0);
                    else {
                        if (typeof NulledBot.settings.youtubeLink === "string")
                            API.sendChat(subChat(NulledBot.chat.youtube, {name: chat.un, link: NulledBot.settings.youtubeLink}));
                    }
                }
            }
        }
    };

    loadChat(NulledBot.startup);
}).call(this);
