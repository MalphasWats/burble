(function (window) {

    function Burble()
    {
        var panel = document.createElement('div');
        panel.id = 'burble';
		
		var action_link = document.createElement('a');
		action_link.href='#';
		
		action_link.addEventListener('click', this.expand_compose_panel);
		
		/* Check to see if authenticated */
		if (this.is_logged_in())
		{
			action_link.innerHTML = 'compose';
            
            this.add_edit_links();
		}
		else
		{
			action_link.innerHTML = 'login';
		}
		
        panel.appendChild(action_link);
		
        document.body.insertBefore(panel, document.body.firstChild);
    }
	
	Burble.prototype.is_logged_in = function()
	{
		return (localStorage.github_username && localStorage.github_email && localStorage.github_api_key);
	}
    
    Burble.prototype.add_edit_links = function()
    {
        var permalinks = document.getElementsByClassName('blurb_date');
        for (var i=0 ; i<permalinks.length ; i++)
        {
            var url = permalinks[i].getElementsByTagName('a')[0].href;
            var a = document.createElement('a');
            a.href = '#' + url.substring(url.indexOf('/burble/')+8, url.indexOf('.html')).replace(/\//g, '-');
            a.innerHTML = 'edit';
            
            a.addEventListener('click', function(e)
            {
                e.preventDefault();
                
                burble.collapse_compose_panel(e);
                burble.expand_compose_panel(e);
                
                var filename = '_posts/' + this.href.substr(this.href.indexOf('#')+1) + '.markdown';
                var url = 'https://api.github.com/repos/'+localStorage.github_username+'/burble/contents/'+filename+'?path='+filename+'&ref=gh-pages&username='+localStorage.github_username;
                
                burble.get(url, function(responseText)
                {
                    var post = JSON.parse(responseText);
                    var b = document.getElementById('burble');
                    var f = b.getElementsByTagName('form')[0];
                    
                    post.content = atob(post.content);
                    var i = post.content.indexOf("---", 3);
                    
                    var post_content = post.content.substr(i+4);
                    var post_yaml = post.content.substr(0, i+4);
                    
                    f.blurb.value = post_content;
                    
                    var yaml = document.createElement('input');
                    yaml.type = 'hidden';
                    yaml.name = 'yaml';
                    yaml.id = 'yaml';
                    yaml.value = post_yaml;
                    
                    f.appendChild(yaml);
                    
                    var path = document.createElement('input');
                    path.type = 'hidden';
                    path.name = 'path';
                    path.id = 'path';
                    path.value = post.path;
                    
                    f.appendChild(path);
                    
                    var sha = document.createElement('input');
                    sha.type = 'hidden';
                    sha.name = 'sha';
                    sha.id = 'sha';
                    sha.value = post.sha;
                    
                    f.appendChild(sha);
                    
                }, burble.collapse_compose_panel);
            });
            
            permalinks[i].appendChild(document.createTextNode(' | '));
            permalinks[i].appendChild(a);
        }
    }
	
	Burble.prototype.expand_login_panel = function(e)
    {
        e.preventDefault();   
        var f = document.createElement('form');
		
        var b = document.getElementById('burble')
        b.appendChild(f);
        var a = b.firstChild;
        a.removeEventListener('click', burble.expand_login_panel);
        a.innerHTML = 'cancel';
        a.addEventListener('click', burble.collapse_compose_panel);
    }
    
    Burble.prototype.expand_compose_panel = function(e)
    {
        e.preventDefault();
		
		var b = document.getElementById('burble');
		var a = b.firstChild;
		
        var f = document.createElement('form');
		
		if (burble.is_logged_in())
		{
			var ts = new Date();
			var time = ('0' + ts.getHours()).slice(-2) + ':' + ('0' + ts.getMinutes()).slice(-2) + ':' + ('0' + ts.getSeconds()).slice(-2);
			var date = ts.getFullYear() + '-' + ('0' + (ts.getMonth()+1)).slice(-2) + '-' + ('0' + ts.getDate()).slice(-2);
			
			var dt = document.createElement('input');
			dt.type = 'hidden';
			dt.name = 'blurb_date';
			dt.id = 'blurb_date';
			dt.value = date;
			
			f.appendChild(dt);
			
			var tm = document.createElement('input');
			tm.type = 'hidden';
			tm.name = 'blurb_time';
			tm.id = 'blurb_time';
			tm.value = time;
			
			f.appendChild(tm);
			
			var t = document.createElement('textarea');
			t.id='blurb';
			t.cols = '35';
			t.rows = '6';
        
			f.appendChild(t);
			
			var u = document.createElement('input');
			u.type = 'file'
			u.setAttribute('multiple', '');
			u.name = 'files[]';
			u.id = 'files';
			
			u.addEventListener('change', function(e)
			{
				var b = document.getElementById('burble');
				var f = b.getElementsByTagName('form')[0];
				
				var m = f.blurb.value.indexOf('<!-- files -->')
				if (m == -1)
				{
					f.blurb.value  += "\n\n<!-- files -->\n";
				}
				else
				{
					f.blurb.value = f.blurb.value.substring(0, m) + "<!-- files -->\n";
				}
				
				for (var i=0 ; i<f.files.files.length ; i++)
				{
					if (f.files.files[i].type.match('image.*')) 
					{
						f.blurb.value  += '!';
					}
					f.blurb.value  += '['+f.files.files[i].name+'](' + document.location.href + 'files/' + f.blurb_date.value + '-' + f.blurb_time.value.replace(/:/g, "") + '/' + f.files.files[i].name + ')\n';
				}
			});
			
			f.appendChild(u);
			
			var c = document.createElement('span');
			c.innerHTML = '0';
			f.appendChild(c);
			
			t.addEventListener('keyup', function(e)
			{
    			this.innerHTML = e.target.value.length
			}.bind(c));
        
			var s = document.createElement('input');
			s.type = 'submit';
			s.value = 'post';
			f.appendChild(s);
			
			f.addEventListener('submit', burble.submit_blurb);
		}
		else
		{
			var t = burble.create_text_input('username', 'GitHub Username');
			f.appendChild(t);
			
			t = burble.create_text_input('email', 'E-mail Address');
			f.appendChild(t);
			
			t = burble.create_password_input('token', 'API Token');
			f.appendChild(t);
			
			var s = document.createElement('input');
			s.type = 'submit';
			s.value = 'login';
			f.appendChild(s);
			
			f.addEventListener('submit', burble.login);
		}
        
        b.appendChild(f);
        
        a.removeEventListener('click', burble.expand_compose_panel);
        a.innerHTML = 'cancel';
        a.addEventListener('click', burble.collapse_compose_panel);
    }
    
    Burble.prototype.collapse_compose_panel = function(e)
    {
        e.preventDefault();
        
        var b = document.getElementById('burble');
        var a = b.firstChild;
        var f = a.nextSibling;
        if (!f) return;
        b.removeChild(f);
        
        a.removeEventListener('click', burble.collapse_compose_panel);
		if (burble.is_logged_in())
		{
			a.innerHTML = 'compose';
		}
		else
		{
			a.innerHTML = 'login';
		}
        a.addEventListener('click', burble.expand_compose_panel);
    }
	
	Burble.prototype.login = function(e)
	{
		e.preventDefault();
		var b = document.getElementById('burble');
        var f = b.getElementsByTagName('form')[0];
		
		if (f.username.value != '' && f.username.value != f.username.title &&
			f.email.value != '' && f.email.value != f.email.title &&
			f.token.value != '' && f.token.value != f.token.title)
        {
			var filename = "index.html";
			var url = 'https://api.github.com/repos/'+f.username.value+'/burble/contents/'+filename+'?path='+filename+'&ref=gh-pages&username='+f.username.value;
			
			var req = new XMLHttpRequest()
			req.onreadystatechange = function()
			{
				if (this.readyState == 4)
				{
					if (this.status != 200)
					{
						console.log("An error occurred whilst trying to make request", this.status, this.responseText)
					}
					else
					{
						var b = document.getElementById('burble');
						var f = b.getElementsByTagName('form')[0];
						
						localStorage.github_username = f.username.value;
						localStorage.github_email = f.email.value;
						localStorage.github_api_key = f.token.value;
						
						burble.collapse_compose_panel(e);
                        
                        burble.add_edit_links();
					}
				}
			}
		
			req.open('GET', url);
			req.setRequestHeader("Authorization", "token "+f.token.value);
			req.setRequestHeader("User-Agent", f.username.value);
			
			req.send(null);
		}
	}
    
    Burble.prototype.logout = function(e)
    {
        delete localStorage.github_username;
        delete localStorage.github_email;
        delete localStorage.github_api_key;
        
        burble.collapse_compose_panel(e);
        
        var permalinks = document.getElementsByClassName('blurb_date');
        for (var i=0 ; i<permalinks.length ; i++)
        {
            permalinks[i].removeChild(permalinks[i].lastChild);
            permalinks[i].removeChild(permalinks[i].lastChild);
        }
    }
    
    Burble.prototype.submit_blurb = function(e)
    {
        e.preventDefault();
        var b = document.getElementById('burble');
        var f = b.getElementsByTagName('form')[0];
		
		if (f.blurb.value == 'logout')
		{
            burble.logout(e);
			return;
		}
        
        var time = f.blurb_time.value;
        var date = f.blurb_date.value;
        
        if (f.path && f.sha)
        {
            var blurb = f.yaml.value + f.blurb.value.replace("<!-- files -->\n", '');
            var filename = f.path.value;
            var sha = f.sha.value;
        }
		else
        {
            var yaml = "---\nlayout: index\ntitle: "+time+"\ndate: "+date+" "+time+"\n---\n";
		
            var blurb = yaml + f.blurb.value.replace("<!-- files -->\n", '');
        
            var filename = "_posts/"+date+"-"+time.replace(/:/g, "")+".markdown";
            var sha = false;
        }
		
		var url = 'https://api.github.com/repos/'+localStorage.github_username+'/burble/contents/'+filename+'?username='+localStorage.github_username;
		
		for (var i=0 ; i<f.files.files.length ; i++)
		{
			f.files.files[i].folder = "files/"+date+"-"+time.replace(/:/g, "");
			var r = new FileReader();
			r.addEventListener('load', function(e)
			{
				var content = e.target.result.split(',')[1];
				
				var filename = this.folder + "/" + this.name;
				var url = 'https://api.github.com/repos/'+localStorage.github_username+'/burble/contents/'+filename+'?username='+localStorage.github_username;
				
				var data = {
					path: filename,
					content: content,
					message: 'upload file ' + this.name,
					branch: 'gh-pages',
					committer: {name: localStorage.github_username, email: localStorage.github_email}
				};
				
				burble.put(data, url);
			}.bind(f.files.files[i]));
			r.readAsDataURL(f.files.files[i])
		}
		
		var data = {
			path: filename,
			content: btoa(blurb),
			message: 'post blurb',
			branch: 'gh-pages',
			committer: {name: localStorage.github_username, email: localStorage.github_email}
		};
        
        if (sha)
        {
            data.sha = sha;
            data.message = 'edit blurb';
        }
		
		burble.put(data, url, function()
		{
			burble.collapse_compose_panel(e);
					
			var p = document.createElement('p');
			p.style.textAlign="center";
			var i = document.createElement('img');
			i.src="css/assets/indicator.gif";
			p.appendChild(i);
			
			var b = document.getElementById('blurbs');
			b.insertBefore(p, b.firstChild);
			
			setTimeout(function()
			{
				document.location.reload(true);
			}, 8000);
		});
    }
    
    Burble.prototype.create_text_input = function(id, label)
    {
        var ip = document.createElement('input');
        ip.type = 'text';
        ip.title = label;
        ip.id = id;
        ip.value = label;
        ip.style.color = '#ccc';
	    ip.addEventListener('focus', function(e)
	    {
            if (this.value == this.title)
            {
                this.value = "";
	            this.style.color = 'black';
	        }
        });
	    ip.addEventListener('blur', function(e)
        {
            if (this.value == "")
            {
                this.value=this.title;
                this.style.color='#ccc';
            }
        });
        
        return ip;
    }
	
	Burble.prototype.create_password_input = function(id, label)
    {
        var ip = document.createElement('input');
        ip.type = 'text';
        ip.title = label;
        ip.id = id;
        ip.value = label;
        ip.style.color = '#ccc';
	    ip.addEventListener('focus', function(e)
	    {
            if (this.value == this.title)
            {
                this.value = "";
	            this.style.color = 'black';
				this.type = 'password';
	        }
        });
	    ip.addEventListener('blur', function(e)
        {
            if (this.value == "")
            {
                this.value=this.title;
                this.style.color='#ccc';
				this.type = 'text';
            }
        });
        
        return ip;
    }
    
    Burble.prototype.get = function(url, callback_20x, callback_404)
    {
        var req = new XMLHttpRequest();
		req.callback_20x = callback_20x;
        req.callback_404 = callback_404;
		req.onreadystatechange = function()
		{
			if (this.readyState == 4)
			{
				if (this.status != 200 && this.status != 201)
				{
					if (typeof this.callback_404 !== 'undefined')
                    {
                        this.callback_404(this.responseText);
					}
				}
				else
				{
					if (typeof this.callback_20x !== 'undefined')
                    {
                        this.callback_20x(this.responseText);
					}
				}
			}
		}
	
		req.open('GET', url);
		req.setRequestHeader("Authorization", "token "+localStorage.github_api_key);
		req.setRequestHeader("User-Agent", localStorage.github_username);
					
		req.send();
    }
	
	
	Burble.prototype.put = function(data, url, callback)
    {
        var req = new XMLHttpRequest();
		req.callback = callback;
		req.onreadystatechange = function()
		{
			if (this.readyState == 4)
			{
				if (this.status != 200 && this.status != 201)
				{
					console.log("An error occurred whilst trying to make request", this.status, this.responseText)
				}
				else
				{
					if (typeof this.callback !== 'undefined')
                    {
                        this.callback(this.responseText);
					}
				}
			}
		}
	
		req.open('PUT', url);
		req.setRequestHeader("Authorization", "token "+localStorage.github_api_key);
		req.setRequestHeader("User-Agent", localStorage.github_username);
					
		req.send(JSON.stringify(data));
    }
    
    window.burble = new Burble();
    
})(window);