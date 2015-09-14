// ==UserScript==
// @name        Nulled Mod Helper
// @author      Helios
// @description Nulled.io Mod Helper
// @include     https://www.nulled.io/topic/*
// @include     https://www.nulled.io/user/*-*
// @include     https://www.nulled.io/index.php?app=core&module=modcp&tab=iplookup&fromapp=members&_do=submit*
// @include     https://www.nulled.io/index.php?app=core&module=modcp&tab=iplookup&fromapp=members&_do=submit&iptool=members&ip=*&st=*
// @version     0.8
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @run-at      document-start
// ==/UserScript==

/*
Changelog:
---v0.8
-Added "ban every fucking retard in this thread"-button
***Don't fucking missclick it***
---v0.7
-Added ban counter
-Fixed a bug (It now shows the notification when banning from profile)
---v0.6
-Fixed a bug (Multi-ban was not working as it should)
---v0.5
- Hide IPs Mode Added
- "Quake Mode" Added
- Imogen <3
---v0.4
- Quick Warn button Added
- You can now select the groups that are applicable for a ban. ***NOTE: Does not work in User Profile Ban button (it's an autonomous instaban)***
- Multi-Ban feture now adds this note: 'Multi' (Can not be edited via settings panel)
- Minor changes
---v0.3
- Added Multi-Ban feature at "IP Address Look-up Tool"
- Added Profile ban button
- Updated Notifications
---v0.2
Security Features:
- Added requirements to ban a user (postocunt, reputaion, leecher value)
- Works only for "Members" user group
*/

var modHelper = (function()
{
	var me ={};

	me.init = function(){
		if(typeof me.settings.getSetting('banCounts') == 'undefined' || me.settings.getSetting('banCounts') === null){
			me.loadDefaultSettings();
		}
        
		url = window.location.href;

		if(url.substr(0,28) == 'https://www.nulled.io/topic/'){
			me.warningButton.init();
			me.banButton.injectButton();
			me.banButton.addListenter();

			me.pageBan.init();
						
			if(me.settings.getSetting('hide_IPS') === 1)
				me.hideIPs.topic.init();
			if(me.settings.getSetting('Quake_Mode') === 1)
				me.quake.init();
			
		}

		if(url == 'https://www.nulled.io/index.php?app=core&module=modcp&tab=iplookup&fromapp=members&_do=submit' || url.substr(0,112) == 'https://www.nulled.io/index.php?app=core&module=modcp&tab=iplookup&fromapp=members&_do=submit&iptool=members&ip='){
			me.multiBan.init();
			if(me.settings.getSetting('Quake_Mode') === 1)
				me.quake.init();
		}

		if(url.substr(0,27) == 'https://www.nulled.io/user/'){
			me.profileButton.init();
			if(me.settings.getSetting('Quake_Mode') === 1)
				me.quake.init();
		}

		me.banCounter.init();
		me.notify.init();
		me.settings.init();

	}

	me.banCounter = {
		init : function(){

			$('.perma_ban').on("click", function() {
					me.banCounter.count(1);
			});
			$('#ban_user').on("click", function() {
					me.banCounter.count(1);
			});

			$('#multiban').on("click", function() {
				var c = 0 ;
					$('.multiban_checkbox').each(function(){
						if($(this).prop('checked'))
							c +=1;
						
					});
					me.banCounter.count(c);
			});

		},

		count : function(bans){
			count = me.settings.getSetting('banCounts');
			count += bans;
			me.settings.setSetting('banCounts', count);
		},

		reset : function(){
			me.settings.setSetting('banCounts', 0);
			me.notify.show('Ban counter has been set to 0.', 5000);
		}
	}

	me.pageBan = {

		init : function(){
			$('.topic_buttons').first().prepend('<li><a href="javascript:;" title="Bann all users in this page" id="OnePageBan">Ban All (Current Page)</a></li>');

			$('#OnePageBan').on( "click", function() {
  				if(confirm('You are about to ban all the users is this page. Continue?')){
  					$('.perma_ban').each(function(){
  						//$(this).click();
  						me.banButton.clickEvent($(this), false);
  					});
  					me.notify.show('Users banned.', 6000);
  				}
			});
		}
	}

	me.banButton = {
		injectButton : function(){
			var c = 0;
			$(".post_controls").each(function(){
				$(this).first().prepend('<li><a href="javascript:void(0)" class="perma_ban" data-count="' + c + '">Ban User</a></li>');
				c++;
			});
		},

		addListenter : function(){
			$('.perma_ban').on( "click", function() {
  				me.banButton.clickEvent(this);
  				
			});
		},

		clickEvent : function(el, notify){
			notify = typeof notify !== 'undefined' ? notify : true;

			var count = $(el).attr('data-count');
			var postid = $('.post_block').eq(count).attr('id').replace('post_id_', '');
			var memberid =  $('.post_username').eq(count).children().first().children().first().attr('hovercard-id');
			var postCount = parseInt($.trim($('.user_details ').eq(count).children('.custom_fields').children('.customprof').eq(0).children().eq(1).text()));
			var reputation = parseInt($.trim($('.user_details ').eq(count).children('.custom_fields').children('.customprof').eq(2).children().eq(1).text()));
			var leecherCount = $.trim($('.user_details ').eq(count).children('.custom_fields').children('.customprof').eq(3).children().eq(1).text().replace(')', '').replace('Bad (',''));
			var primaryGroup = $.trim($('.group_title').eq(count).text());


			if(leecherCount == 'Neutral')
				leecherCount = 0;
			if(leecherCount == 'LEECHER')
				leecherCount = -100;

			leecherCount = parseInt(leecherCount);

			if(isNaN(reputation) || isNaN(postCount)){
				me.notify.show('Can not proceed. Invalid Data.', 5600);
				return;
			}

			if(isNaN(leecherCount))
				leecherCount = 0;

			/*if(primaryGroup != 'Members'){
				me.notify.show('Security resctriction: Can not ban group ' + primaryGroup, 5600);
				return;
			}*/

			var banGroups = me.settings.getSetting('banGroups').split(',');
			var found = false;
			for (var i in banGroups) {
				if(banGroups[i] == primaryGroup)
					found = true;
			}

			if(!found){
				me.notify.show('User settings: Can not ban group ' + primaryGroup, 6600);
				return;
			}



			if((me.settings.getSetting('verify_posts') == 1  && postCount > parseInt(me.settings.getSetting('post_counter'))) || (me.settings.getSetting('verify_rep') == 1  && reputation > parseInt(me.settings.getSetting('rep_counter'))) || (me.settings.getSetting('verify_leecher') == 1  && leecherCount > parseInt(me.settings.getSetting('leecher_counter')))){
				me.notify.show('Requirements met! Ingoring user.', 5600);
				return;
			}


			if(typeof memberid == 'undefined'){
				me.notify.show('Can not procceed.', 5000);
				return;
			}


			me.banButton.banUser(memberid, postid, notify);
			return false;
		},

		banUser : function(member, postid, notify){
			var url = 'https://www.nulled.io/index.php?app=members&module=profile&section=warnings&do=save&member=' + member;
			var postData = {
				from_app : 'forums',
				from_id1 : postid,
				from_id2 : '',
				reason : me.settings.getSetting('reason_id'),
				points : 1,
				isRte : 0,
				noSmilies : 0,
				note_member : me.settings.getSetting('note_member'),
				note_mods : me.settings.getSetting('note_mods'),
				mq : 0,
				mq_unit : 'd',
				rpa : 0,
				rpa_unit : 'd',
				suspend_perm : 'on',
				suspend : 0,
				suspend_unit : 'd',
				ban_group : 1,
				ban_group_id : 5,
				remove : '',
				remove_unit : 'd'

			};
			if(notify){
				$.post(url, postData, function(data) {
					me.notify.show('User Banned', 6000);
				});
			}else{
				$.post(url, postData, function(data) {});
			}
			

		}
	}

	me.multiBan = {
		init : function(){
			$('.ipsButton_secondary.ipsType_smaller').each(function(){
				mid = $(this).attr('href').split('mid=')[1];
				$(this).parent().append('<input style="margin-left: 50px;" type="checkbox" class="multiban_checkbox" data-mid="' + mid +'" checked>');
			});

			$('.topic_controls').first().append('<a id="multiban" class="ipsButton_secondary" href="javascript:void(0);" title="Ban Users" style="float: right;">Ban Users</a>');

			$('#multiban').on( "click", function() {
  				me.multiBan.clickEvent();
			});
		},

		clickEvent : function(){
			var delay = 1200;
			var i = 0;
			$('.multiban_checkbox').each(function(){
				if($(this).prop('checked')){
					//username = $(this).parent().parent().children().first().text();
					element = $(this).parent().parent();
					userid = $(this).attr('data-mid');
					me.multiBan.ban(userid, element);//} , (i * delay) + 100);
					i++;
				}
			});
			me.notify.show('Users banned', 5000);
		},

		ban : function(member, el){
			var url = 'https://www.nulled.io/index.php?app=members&module=profile&section=warnings&do=save&member=' + member;
			var reason = (typeof el === 'string') ? '' : 'Multi';
			var postData = {
				from_app : 'members',
				from_id1 : '',
				from_id2 : '',
				reason : me.settings.getSetting('reason_id'),
				points : 1,
				isRte : 0,
				noSmilies : 0,
				note_member : reason,
				note_mods : '',
				mq : 0,
				mq_unit : 'd',
				rpa : 0,
				rpa_unit : 'd',
				suspend_perm : 'on',
				suspend : 0,
				suspend_unit : 'd',
				ban_group : 1,
				ban_group_id : 5,
				remove : '',
				remove_unit : 'd'

			};

			$.post(url, postData, function(){}).done(function(a,b,c){
				if(typeof el === 'string'){
					me.notify.show('User ' + el + ' banned.', 5000);
				}else{
					$(el).children().each(function(){$(this).css('background', '#4A1A14')});
				}
			});
		}
	}

	me.warningButton = {
		init : function(){
			var c = 0;
			$(".post_controls").each(function(){
				$(this).first().prepend('<li><a href="javascript:void(0)" class="warn_btn" data-count="' + c + '">Warn User</a></li>');
				c++;
			});
			$('.warn_btn').on( "click", function() {
  				me.warningButton.clickEvent(this);
			});
		},

		clickEvent : function(el){
			var count = $(el).attr('data-count');
			var postid = $('.post_block').eq(count).attr('id').replace('post_id_', '');
			var memberid =  $('.post_username').eq(count).children().first().children().first().attr('hovercard-id');
			var username =  $('.post_username').eq(count).children().first().children().first().text();
			
			var url = "https://www.nulled.io/index.php?app=members&module=profile&section=warnings&do=add&member={mid}&from_app=forums&from_id1={fid}&from_id2=".replace('{mid}', memberid).replace('{fid}', postid);

			var width = me.settings.getSetting('warn_window_width');
			var height = me.settings.getSetting('warn_window_height');

			var left = (screen.width/2)-(width/2);

			var windowSettings = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,width=" + width +",height=" + height +",top=0,left=" + left;
			var warnWindow = window.open(url, "Warn " + username + " User", windowSettings);

		}

	},

	me.profileButton = {
		init : function(){
			$('ul.topic_buttons').append('<li><a href="javascript:void(0);" id="ban_user">Ban User</a></li>');

			$('#ban_user').on( "click", function() {
				memid = $("#ban_user").parent().parent().children().eq(1).find("a[href]").attr('href').split('fromMemberID=')[1];
				username = window.location.href.split('/user/' + memid + '-')[1].slice(0, -1);
				me.multiBan.ban(memid, username);
			});
		}


	}

	me.isTopic = function(){
		return $('.ipsUserPhotoLink').length > 1;
	}

	me.loadDefaultSettings = function(){
		me.settings.setSetting('reason_id', 4);
		me.settings.setSetting('note_member', '');
		me.settings.setSetting('note_mods', '');

		me.settings.setSetting('verify_posts', 0);
		me.settings.setSetting('post_counter', 27);
		me.settings.setSetting('verify_rep', 0);
		me.settings.setSetting('rep_counter', 20);
		me.settings.setSetting('verify_leecher', 0);
		me.settings.setSetting('leecher_counter', 7);

		me.settings.setSetting('warn_window_width', 1100);
		me.settings.setSetting('warn_window_height', 870);

		me.settings.setSetting('banGroups', 'Guests,Members,Validating,VIP');

		me.settings.setSetting('hide_IPS', 0);
		me.settings.setSetting('Quake_Mode', 0);

		me.settings.setSetting('banCounts', 0);


	}

	me.hideIPs = {

		topic : {
			init : function(){
				//Inject
				$('.ip a').each(function(){
					ip = $(this).html();
					href = $(this).attr('href');


					$(this).attr('href', '#Hidden-IP-:)');
					$(this).html(' &nbsp;Show IP');
					$(this).addClass('show-ip');
					$(this).attr('data-IP', ip);
					$(this).attr('data-href', href);
				});

				//Event listener
				$('.show-ip').on( "click", function(e) {
					e.preventDefault();
					ip = $(this).attr('data-IP');
					href = $(this).attr('data-href');

					$(this).removeClass('show-ip');
					$(this).attr('href', href);
					$(this).html(ip);
					$(this).unbind('click');
				});
			}
		},
	},

	me.quake = {
		init : function(){
			me.quake.banCount = 0;

			$('.perma_ban').on("click", function() {
					me.quake.banStreak(1);
			});
			$('#ban_user').on("click", function() {
					me.quake.banStreak(1);
			});

			$('#multiban').on("click", function() {
				var c = 0 ;
					$('.multiban_checkbox').each(function(){
						if($(this).prop('checked'))
							c +=1;
						
					});
					me.quake.banStreak(c);
			});

		},

		banStreak : function(count){
			if(count === 0)
				return;
			me.quake.banCount += count;
			var soundStreak = ['impressive.wav', 'doublekill.wav', 'triplekill.wav', 'humiliation.wav', 'rampage.wav', 'killingspree.wav', 'unstoppable.wav', 'multikill.wav', 'monsterkill.wav', 'ludicrouskill.wav', 'wickedsick.wav', 'ultrakill.wav', 'dominating.wav', 'holyshit.wav', 'combowhore.wav', 'godlike.wav'];
			if(me.quake.banCount > soundStreak.length)
				me.quake.banCount = soundStreak.length;

			me.quake.audio = new Audio('https://raw.githubusercontent.com/Helioscx/QuakeSounds/master/sounds/' + soundStreak[me.quake.banCount - 1]);
			me.quake.audio.play();
		}
	},

	me.settings = {
		getSetting : function(setting){
			return GM_getValue(setting);
		},

		setSetting : function(setting, value){
			GM_setValue(setting, value);
		},

		init : function(){
			var left = window.innerWidth / 2 - (538 / 2);
			GM_addStyle('#mod_helper_settings{background: #2d2d2d;color: #d5d5d5;position: fixed; top: 10px;width:510px;left: ' + left + 'px;padding: 12px;border: 2px solid #a5a5a5;box-shadow: 4px 4px 22px #000;text-align:center;}.mod_helper_textarea{width:300px;height:100px;background: #3a3a3a; color: #fff;}');
			

			//window.setTimeout(function(){$("td[id^='cke_contents_editor']").children().first().val('')} , 2000);

			$('#admin_bar').children().first().append('<li><a href="#" id="mod_helper_sett">Mod Helper Settings</a></li>');


			$('#mod_helper_sett').on("click", function(){
				var html = '<div id="mod_helper_settings" style="display:none;">Reason: <br> ';
				html += '<select id="mod_helper_reasons"><option value="1">Spamming</option><option value="2">Inappropriate Language</option><option value="3">Signature Violation</option><option value="4">Abusive Behaviour</option><option value="5">Topic Bumping</option><option value="6">Member does not leave proper replies</option></select> <br>';
				html += 'Member Note: <br> <textarea id="mod_helper_member_reason" class="mod_helper_textarea"></textarea><br>';
				html += 'Mod Note: <br> <textarea id="mod_helper_mod_reason" class="mod_helper_textarea"></textarea><br><br>';
				html += '<input type="checkbox" id="mod_helper_verify_post"> Ignore users with posts greater than: <input type="textbox" id="mod_helper_post_count" style="width: 25px;text-align:center;margin-left: 5px;"><br>';
				html += '<input type="checkbox" id="mod_helper_verify_rep"> Ignore users with reputation greater than: <input type="textbox" id="mod_helper_rep_count" style="width: 25px;text-align:center;margin-left: 5px;"><br>';
				html += '<input type="checkbox" id="mod_helper_verify_leecher"> Ignore users with leecher greater than: <input type="textbox" id="mod_helper_leecher_count" style="width: 25px;text-align:center;margin-left: 5px;"><br><br>';
				html += '<strong>Warn Button</strong> <br>';
				html+= 'Window Width: <input type="textbox" id="mod_helper_window_width" style="width: 40px;text-align:center;margin-left: 5px;"> px<br>';
				html+= 'Window Height: <input type="textbox" id="mod_helper_window_height" style="width: 40px;text-align:center;margin-left: 5px;"> px<br><br>';
				html += '<strong>Ban only the following groups:</strong> <br>';
				html += '<select id="member_groups_ignore" style="width:300px;" multiple="multiple" size="8"><option value="Banned">Banned</option><option value="Contributor">Contributor</option><option value="Donator">Donator</option><option value="Guests">Guests</option><option value="Legendary">Legendary</option><option value="Members">Members</option><option value="Reverser">Reverser</option><option value="Validating">Validating</option><option value="VIP">VIP</option></select>';
				html += '<br><br><strong>Special Modes:</strong> <br>';
				html += '<input type="checkbox" id="mod_helper_hide_ip"> Hide IPs<br>';
				html += '<input type="checkbox" id="mod_helper_quake"> Enable "Quake Mod"<br>';
				html += '<br><strong>Ban Counter</strong> <br>';
				html += 'Total Bans: <strong>' + me.settings.getSetting('banCounts') + '</strong> <br>';
				html += '<a href="javascript:void(0);" id="mod_helper_banCounterReset">Reset Ban Counter</a>';
				html += '<br><br><input type="submit" value="Save Settings" id="mod_helper_save"></div>';
				$(document.body).append(html);

				$('#mod_helper_reasons').val(me.settings.getSetting('reason_id'));
				$("#mod_helper_member_reason").val(me.settings.getSetting('note_member'));
				$("#mod_helper_mod_reason").val(me.settings.getSetting('note_mods'));

				$("#mod_helper_verify_post").prop('checked', me.settings.getSetting('verify_posts') == 1);
				$("#mod_helper_verify_rep").prop('checked', me.settings.getSetting('verify_rep') == 1);
				$("#mod_helper_verify_leecher").prop('checked', me.settings.getSetting('verify_leecher') == 1);

				$("#mod_helper_post_count").val(me.settings.getSetting('post_counter'));
				$("#mod_helper_rep_count").val(me.settings.getSetting('rep_counter'));
				$("#mod_helper_leecher_count").val(me.settings.getSetting('leecher_counter'));

				$("#mod_helper_window_width").val(me.settings.getSetting('warn_window_width'));
				$("#mod_helper_window_height").val(me.settings.getSetting('warn_window_height'));

				$("#mod_helper_hide_ip").prop('checked', me.settings.getSetting('hide_IPS') == 1);
				$("#mod_helper_quake").prop('checked', me.settings.getSetting('Quake_Mode') == 1);

				var banGroups = me.settings.getSetting('banGroups').split(',');

				$('#member_groups_ignore option').each(function(){
					for (var i in banGroups) {
						if(banGroups[i] == $(this).val()){
							$(this).prop('selected', true);
						}
					}
				});


				$('#mod_helper_save').on( "click", function() {
  					me.settings.save();
  					return false;
				});

				$('#mod_helper_banCounterReset').on( "click", function() {
  					me.banCounter.reset();
				});

  				$('#mod_helper_settings').fadeIn();
  				return false;
			});
		},

		save : function(){
			me.settings.setSetting('reason_id', $("#mod_helper_reasons").val());
			me.settings.setSetting('note_member', $("#mod_helper_member_reason").val());
			me.settings.setSetting('note_mods', $("#mod_helper_mod_reason").val());

			me.settings.setSetting('verify_posts', ($("#mod_helper_verify_post").is(":checked")) ? 1 : 0);
			me.settings.setSetting('verify_rep', ($("#mod_helper_verify_rep").is(":checked")) ? 1 : 0);
			me.settings.setSetting('verify_leecher', ($("#mod_helper_verify_leecher").is(":checked")) ? 1 : 0);

			me.settings.setSetting('post_counter', $("#mod_helper_post_count").val());
			me.settings.setSetting('rep_counter', $("#mod_helper_rep_count").val());
			me.settings.setSetting('leecher_counter', $("#mod_helper_leecher_count").val());

			me.settings.setSetting('warn_window_width', $("#mod_helper_window_width").val());
			me.settings.setSetting('warn_window_height', $("#mod_helper_window_height").val());

			me.settings.setSetting('hide_IPS', ($("#mod_helper_hide_ip").is(":checked")) ? 1 : 0);
			me.settings.setSetting('Quake_Mode', ($("#mod_helper_quake").is(":checked")) ? 1 : 0);


			var banGroups = '';
			$('#member_groups_ignore option:selected').each(function(){
				banGroups += $(this).val() + ',';
			});

			me.settings.setSetting('banGroups', banGroups);

			$('#mod_helper_settings').fadeOut(600, function(){
				$("#mod_helper_settings").remove();
			});
		}
	}

	me.notify = {
		init : function(){
			GM_addStyle('.mh_notify{background: #2d2d2d;color: #d5d5d5;position: fixed; top: 10px;right: -210px;max-width:200px;text-align:center;padding: 4px 12px 7px 12px;border: 2px solid #a5a5a5;box-shadow: 4px 4px 22px #000;}.mh_animate{-webkit-animation: slide 1s ease forwards;-moz-animation: slide 1s ease forwards;animation: slide 1s ease forwards;}@-moz-keyframes slide{100%{right:15px}}@-webkit-keyframes slide{100%{right:15px}}@keyframes slide{100%{right:15px}}');
		},

		show : function(text, time){
			time += 2300;
			$(document.body).append('<div class="mh_notify mh_animate" data-timer="' + time + '" style="top:' + me.notify.getPositionY() + 'px;">' + text + '</div>');

			if(typeof me.notify.timer == "undefined"){
				me.notify.timer = setInterval(function(){me.notify.tick()} , 100);
			}

		},


		getPositionY : function(){
			if($('.mh_notify').length == 0)
				return 10;

			el = $('.mh_notify').last();
			return parseInt(el.css('top').slice(0,-1)) + el.height() + 30;

		},

		tick : function(){
			me.notify.alerts.tick();
			me.notify.alerts.removeExpired();
		},

		alerts : {
			tick : function(){
				$('.mh_notify').each(function(){
					var time = $(this).attr('data-timer');
					$(this).attr('data-timer', time - 200);
				});
			},

			removeExpired : function(){
				$('.mh_notify').each(function(){
					var time = $(this).attr('data-timer');
					if(time <= 0){
						if(!$(this).is(':animated')){
							$(this).css('right', '15px');
							$(this).removeClass('mh_animate');
							$(this).animate({"right": "-250px"}, 800, function(){
								me.notify.alerts.moveAlerts($(this).attr('data-index'));
								$(this).remove();
							});
						}
						
					}
				});
			},

			moveAlerts : function(index){
				var top = 10;
				$('.mh_notify:gt(' + index + ')').each(function(){
					$(this).delay(500).animate({'top' : top + 'px'}, 'fast');
					top += $(this).height() + 30;
				});
			}

		}
	}


	return me;
})();


$(function(){
	modHelper.init();
});
