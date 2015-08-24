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
		mouseup: false,
		resize: false,
		tick: false,
		x: undefined,
		y: undefined
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

	option: {
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
			tap: 'res/tap.ogg'
		};

		window.onload = function() {
			game.event.listener(event);
		};

		window.onmousedown = function() {
			game.event.listener(event);
			game.play(game.audio.tap, 1, false);
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
		game.draw.rectangle = {
			x: game.event.x,
			y: game.event.y,
			h: 10,
			w: 10,
			color: '#223355',
			id: 'pixel'
		};
	}
};

game.preloading();