$(document).ready(function() {
	function randomint(min,max) {
		return Math.floor(Math.random()*(max-min)+min)
	}

	function shuffle(list) {
		for(var i=list.length-1;i>=0;i--) {
			spot = randomint(i,list.length);
			var t = list[spot];
			list[spot] = list[i];
			list[i] = t;
		}
	}

	function choice(list) {
		return list[randomint(0,list.length)];
	}

	var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

	function wordsearch(words,size,directions) {
		words = words.map(function(word){ return word.toUpperCase();});
		
		var grid = [];
		for(var y=0;y<size;y++) {
			var row = [];
			for(var x=0;x<size;x++) {
				row.push('');
			}
			grid.push(row);
		}
		
		function valid(word,x,y,dx,dy) {
			for(var i=0;i<word.length;i++) {
				if(x<0 || x>=size || y<0 || y>=size || (grid[y][x] && grid[y][x]!=word[i])) {
					return false;
				}
				x += dx;
				y += dy;
			}
			return true;
		}
		
		var positions = [];
		for(var y=0;y<size;y++) {
			for(var x=0;x<size;x++) {
				positions.push([x,y]);
			}
		}
		
		function find_valid(word) {
			shuffle(positions);
			for(var i=0;i<positions.length;i++) {
				shuffle(directions);
				var x = positions[i][0];
				var y = positions[i][1];
				for(var j=0;j<directions.length;j++) {
					var dx = directions[j][0];
					var dy = directions[j][1];
					if(valid(word,x,y,dx,dy)) {
						return {x:x,y:y,dx:dx,dy:dy};
					}
				}
			}
			throw(new Error("Can't fit "+word));
		}
		
		words.map(function(word) {
			var pos = find_valid(word);
			var x = pos.x,
					y = pos.y,
					dx = pos.dx,
					dy = pos.dy;
			for(var i=0;i<word.length;i++) {
				grid[y][x] = word[i];
				x += dx;
				y += dy;
			}
		});
		
		positions.map(function(pos) {
			var x = pos[0], 
					y = pos[1];
			if(!grid[y][x]) {
				grid[y][x] = choice(alphabet);
			}
		})
		return grid;
	}


	function go() {
		var words = $('#words').val().split(' ');
		var size = parseInt($('#gridsize').val());

		var direction_names = {
			'up-left': [-1,-1],
			'up-none': [0,-1],
			'up-right': [1,-1],
			'none-left': [-1,0],
			'none-right': [1,0],
			'down-left': [-1,1],
			'down-none': [0,1],
			'down-right': [1,1]
		}
		var directions = [];
		for(var direction_name in direction_names) {
			if($('#directions .'+direction_name).hasClass('on')) {
				directions.push(direction_names[direction_name]);
			}
		}

		$('#wordsearch').html('');
		try {
			var grid = wordsearch(words,size,directions);
			$('#output').show();
			$('#error').hide();
		} catch(e) {
			$('#output').hide();
			$('#error').show().text(e.message);
			return;
		}

		grid.map(function(row,y) {
			var tr = $('<tr/>');
			html += '<tr>';
			row.map(function(letter,x) {
				var input = $('<input maxlength=1>').val(letter).attr('x',x).attr('y',y);
				tr.append($('<td>').append(input));
				html += '<td>'+letter+'</td>';
			})
			tex += row.join(' & ')+' \\\\ \n';
			html += '</tr>\n';
			$('#wordsearch').append(tr);
		})
		
		function makeCode() {
			var tex = '\
\\documentclass{standalone}\n\n\
\\usepackage[thinlines]{easytable}\n\n\
\\begin{document}\n\n\
\\begin{TAB}(e,15pt,15pt){|';
			for(var i=0;i<size;i++) {
				tex += 'c|';
			}
			tex += '}{|';
			for(var i=0;i<size;i++) {
				tex += 'c|';
			}
			tex +='}\n';

			var html = '<table>\n';
		

			grid.map(function(row,y) {
				html += '<tr>';
				row.map(function(letter,x) {
					html += '<td> '+letter+' </td>';
				})
				tex += row.join(' & ')+' \\\\ \n';
				html += '</tr>\n';
			})


			tex += '\
\\end{TAB}\n\n\
\\end{document}';

			html += '</table>';
			$('#tex').text(tex);
			$('#html').text(html);
		};
		makeCode();

		$('#wordsearch').css('font-size',(22/(2*size))+'cm');


		$('#wordsearch input').on('change',function() {
			var x = parseInt($(this).attr('x'));
			var y = parseInt($(this).attr('y'));
			console.log(x,y);
			grid[y][x] = $(this).val();
			makeCode();
		});
	}

	go();

	$('#words,#gridsize').on('change keyup',function() {
		go(); 
	});
	$('#directions td').on('click',function() {
		$(this).toggleClass('on');
		go();
	});
	$('#wordsearch').delegate('input','focus mouseup',function(){ $(this).select(); return false; });
	$('#wordsearch').delegate('input','keyup',function() {$(this).val($(this).val().toUpperCase()); $(this).trigger('change'); });
	$('#reroll').on('click',go);
	$('#print').on('click',function(){window.print()});

});
