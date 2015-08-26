var window = window;

var game = {
	audio: {},

	cache: {},

	canvas: {
		resize: function(force) {
			if((game.event.resize)||(force))
			{
				for(var id in game.canvas) {
					if(id != 'resize') {
						game.canvas[id].height = window.innerHeight;
						game.canvas[id].width = window.innerWidth;
					};
				};

				var h = window.innerHeight;
				var w = window.innerWidth;
				for(var i = 0; i < game.option.quantum; i++) {
					var n = Math.pow(2, i);
					game.canvas['h' + n] = Math.floor(h/n);
					game.canvas['w' + n] = Math.floor(w/n);
					game.canvas['s' + n] = (h < w) ? game.canvas['h' + n] : game.canvas['w' + n];
				};
			};
		}
	},

	check:
	{
		cache: function(id) {
			var cache = (game.cache[id]) ? game.cache[id] : 'cache';
			var frame = (game.scene[id]) ? game.scene[id] : 'frame';
			var draw = ((frame.hash != cache.hash) || (game.event.resize));
			return draw;
		}
	},

	create: {
		set area(json) {
			var area = {};
				area.id = json.id;
				area.x = json.x;
				area.y = json.y;
			game.map[area.id] = area;
			game.map[area.x] = (game.map[area.x]) ? game.map[area.x] : {};
			game.map[area.x][area.y] = area;
		},

		set button(json) {
			var button = {};
				button.audio = (json.audio) ? json.audio : game.audio.tap;
				button.color = json.color;
				button.mousedown = function() {
					if(game.event.mousedown) {
						if(game.event.mouseover(button)) {
							window.console.log(json.id);
							game.play(button.audio, 0.1, false);
						};
					};
				};
				button.draw = function(x, y, h, w) {
					button.x = x;
					button.y = y;
					button.h = h;
					button.w = w;
					game.draw.rectangle = {
						x: x,
						y: y,
						z: 'hud',
						h: h,
						w: w,
						color: button.color,
						id: button.id
					};
				};
				button.id = json.id;
			game.object.button[button.id] = button;
		},

		canvas: function(id, layer) {
			game.canvas[id] = window.document.createElement('canvas');
			game.canvas[id].context = game.canvas[id].getContext('2d');
			game.canvas[id].style.zIndex = layer;
			window.document.body.appendChild(game.canvas[id]);
		}
	},

	draw: {
		set rectangle(json) {
			var frame = {};
				frame.clear = (json.clear) ? json.clear : false;
				frame.color = json.color;
				frame.h = json.h;
				frame.id = json.id;
				frame.w = json.w;
				frame.x = json.x;
				frame.y = json.y;
				frame.z = (json.z) ? json.z : 'background';

				frame.hash = JSON.stringify(frame);

				frame.draw = function(context) {
					if(frame.clear) {
						context.clearRect(frame.x, frame.y, frame.w, frame.h);
					};
					context.fillStyle = frame.color;
					context.fillRect(frame.x, frame.y, frame.w, frame.h);
				};

			game.scene[frame.id] = frame;
		}
	},

	drawing: function() {
		if(game.cache)
		{
			for(var id in game.scene) {
				if(game.check.cache(id)) {
					window.console.log('draw');
					game.scene[id].draw(game.canvas[game.scene[id].z].context);
				};
			};
		};
		game.cache = game.scene;
		game.scene = {};
	},

	event: {
		listener: function(event) {
			game.event.x = (event.x) ? event.x : game.event.x;
			game.event.y = (event.y) ? event.y : game.event.y;
			game.event[event.type] = true;
			game.run();
			game.event[event.type] = false;
		},
		load: false,
		mousedown: false,
		mouseover: function(object) {
			var over = false;
			if((game.event.x >= object.x) && (game.event.x <= object.x + object.w)) {
				if((game.event.y >= object.y) && (game.event.y <= object.y + object.h)) {
					over = true;
				};
			};
			return over;
		},
		mouseup: false,
		resize: false,
		tick: false,
		x: undefined,
		y: undefined
	},

	interface: {
		hud: function() {
			var x, y, h, w;
			h = game.canvas.s8;
			w = game.canvas.s8;

			x = game.canvas.w2 - game.canvas.w32 - game.canvas.w64 - 2*w;
			y = game.canvas.h1 - h - game.canvas.h64;
			game.object.button.fight.mousedown();
			game.object.button.fight.draw(x, y, h, w);

			x = game.canvas.w2 - game.canvas.w64 - w;
			y = game.canvas.h1 - game.canvas.h64 - h;
			game.object.button.craft.mousedown();
			game.object.button.craft.draw(x, y, h, w);

			x = game.canvas.w2 + game.canvas.w64;
			y = game.canvas.h1 - game.canvas.h64 - h;
			game.object.button.chest.mousedown();
			game.object.button.chest.draw(x, y, h, w);

			x = game.canvas.w2 + game.canvas.w32 + game.canvas.w64 + w;
			y = game.canvas.h1 - h - game.canvas.h64;
			game.object.button.upgrade.mousedown();
			game.object.button.upgrade.draw(x, y, h, w);
		}
	},

	load: {
		set audio(json) {
			for(var id in json) {
				var audio = new Audio(json[id]);
				game.audio[id] = audio;
			};
		}
	},

	map: {},

	object: {
		button: {},
		set creator(json) {
			for(var type in json) {
				switch(type) {
					case 'button':
						for(var id in json[type]) {
							game.create.button = {
								audio: json[type][id].audio,
								color: json[type][id].color,
								id: id
							};
						};
						break;
				};
			};
		}
	},

	option: {
		quantum: 8,
		tick: 50,
		volume: 0.5
	},

	play: function(audio, volume, loop) {
		audio.currentTime = 0;
		audio.loop = (loop) ? true : false;
		audio.volume = (volume) ? volume * game.option.volume : game.option.volume;
		audio.play();
	},

	preloading: function() {
		game.create.canvas('background', 0);
		game.create.canvas('hud', 10);
		game.canvas.resize(true);

		game.load.audio = {
			sword: 'res/sword.ogg',
			tap: 'res/tap.ogg'
		};

		game.object.creator = {
			button: {
				chest: {
					audio: game.audio.sword,
					color: '#AEC63A'
				},
				craft: {
					audio: game.audio.sword,
					color: '#FFDD3A'
				},
				fight: {
					audio: game.audio.sword,
					color: '#DB6048'
				},
				upgrade: {
					audio: game.audio.sword,
					color: '#559FDD'
				}
			}
		};

		window.onload = function() {
			game.event.listener(event);
		};

		window.onmousedown = function() {
			game.event.listener(event);
		};

		window.onmouseup = function() {
			game.event.listener(event);
		};

		window.onresize = function() {
			game.event.listener(event);
		};

		window.setInterval(function() {
			var event = {};
				event.type = 'tick';
			game.event.listener(event)
		}, game.option.tick);
	},

	run: function() {
		game.updating();
		game.drawing();
	},

	scene: [],

	updating: function() {
		game.canvas.resize();
		game.interface.hud();
	}
};

game.preloading();