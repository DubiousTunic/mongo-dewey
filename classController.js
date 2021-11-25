$(document).ready(function(){

	$.get("/expand_class/null", function(data){

		$("#dewey_classes").prepend(createForm());

		var class_area = document.createElement("div");

		$("#dewey_classes").append(class_area);
		console.log(data);
		dropClass(data.result, function(err, la){
			$(class_area).append(la);
		})
	})

	function dropClass(data, cb){
		var class_dropdown = document.createElement("div");
		$(class_dropdown).addClass("class_dropdown");
		var class_ul = document.createElement("ul");
		var class_heading = document.createElement("h3");
		
		$(class_dropdown).append(class_heading);
		$(class_dropdown).append(class_ul);

		console.log(data);

		if(cb)
			cb(null, class_dropdown);

		if(data && data.length > 0){
			data.forEach(function(el){
				createHeading(class_ul, el)			
			})	
		}
		
	}

	function createHeading(class_ul, el){
		var li = document.createElement("li");
		var class_heading_a = document.createElement("a");
		$(li).append(class_heading_a)				
		$(class_heading_a).text(el.decimalStr + " " + el.class)
		$(class_heading_a).attr("href", "#classes?dec="+el.decimalStr);
		$(class_ul).append(li);


		var class_heading_b = document.createElement("a");
		$(class_heading_b).attr("href", "#");
		$(class_heading_b).text(el.decimalStr + " " + el.class);
		$(li).append(class_heading_b);	
		
		$(class_heading_b).hide();

		$(class_heading_b).click(function(e){
			$(class_heading_a).toggle();
			$(class_heading_b).toggle();
			$(class_heading_b).nextAll().remove();
		})	

		$(class_heading_a).click(function(e){
			$(class_heading_a).toggle();
			$(class_heading_b).toggle();
			e.preventDefault();
			$.get("/expand_class/" + el._id, function(data){
				dropClass(data.result, function(err, la){
					$(li).append(la);
				})
			})
		})
	}

	var class_id;

	function createForm(el, la){
		var form_div = document.createElement("div");


		var class_form = document.createElement("form");

		$(form_div).append(class_form);
		var form_input_0 = document.createElement("input");
		var form_input_1 = document.createElement("input");
		var form_input_2 = document.createElement("input");

		var form_parent = document.createElement("span");		

		$(form_input_2).css({"width": 77})
		$(form_input_0).css({"width" : 77})

		$(form_input_0).attr("placeholder", "parent");
		$(form_input_1).attr("placeholder", "class");
		$(form_input_2).attr("placeholder", "decimal");

		$(class_form).append(form_input_0);
		$(class_form).append(form_parent);
		$(class_form).append("<br>");
		$(class_form).append(form_input_1);
		$(class_form).append(form_input_2);
		var form_button = document.createElement("button");
		$(class_form).append(form_button);

		$(form_button).text("+")

		/* 
			ADD CLASS 
		*/
		$(form_button).click(function(){
			$.post("/add_class", {parent : class_id, class : $(form_input_1).val(), decimal: $(form_input_2).val()});
			ANCHOR.route("#classes");
		})		

		createRealtime(form_input_0, form_div, form_parent);

		return form_div;
	}

	function createRealtime(form_input, form_div, form_parent){
		var realtimeout;
		$(form_input).keyup(function(){
			$(".solid_ul").empty();
			$(form_parent).text("");
			class_id = null;
			clearTimeout(realtimeout);
			realtimeout = setTimeout(function(){
				$.get("/realtime_class/" + $(form_input).val(), function(data){
					console.log(data.result);
					var ul = document.createElement("ul");
					if(data && data.result){
						data.result.forEach(function(el){
							console.log(el);
							var li = document.createElement("li");
							var a = document.createElement("a");
							$(li).append(a);
							$(a).text(el.decimal + " " + el.class)
							$(a).click(function(e){
								e.preventDefault();
								class_id = el._id;
								$(form_parent).text(el.class);
							})

							$(ul).addClass("solid");

							$(ul).addClass("solid_ul");
							$(form_input).addClass("solid");

							$("body").click(function(e){
								e.preventDefault();
								if(!$(e.target).hasClass("solid")){
									$(ul).hide();
								}
							})

							$(a).attr("href", "#");
							$(ul).append(li);
							$(form_div).append(ul);	
						})		
					}				
				});
			}, 1000)

		})
	}
})