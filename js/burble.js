(function (window) {

    function Burble()
    {
        var panel = document.createElement('div');
        panel.id = 'burble';
		
		var action_link = document.createElement('a');
		action_link.href='#';
		
		action_link.collapse = this.collapse_compose_panel;
		action_link.expand = this.expand_compose_panel;
		
		action_link.addEventListener('click', action_link.expand);
		
		/* Check to see if authenticated */
		if (this.is_logged_in())
		{
			action_link.innerHTML = 'compose';
		}
		else
		{
			action_link.innerHTML = 'login';
		}
		
        panel.appendChild(action_link);
		
        document.body.insertBefore(panel, document.body.firstChild)
    }
	
	Burble.prototype.is_logged_in = function()
	{
		return (localStorage.github_username && localStorage.github_email && localStorage.github_api_key)
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
			t = document.createElement('textarea');
			t.id='blurb';
			t.cols = '35';
			t.rows = '6';
        
			f.appendChild(t);
			
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
					}
				}
			}
		
			req.open('GET', url);
			req.setRequestHeader("Authorization", "token "+f.token.value);
			req.setRequestHeader("User-Agent", f.username.value);
			
			req.send(null);
		}
	}
    
    Burble.prototype.submit_blurb = function(e)
    {
        e.preventDefault();
        var b = document.getElementById('burble');
        var f = b.getElementsByTagName('form')[0];
		
		if (f.blurb.value == 'logout')
		{
			delete localStorage.github_username;
			delete localStorage.github_email;
			delete localStorage.github_api_key;
			
			burble.collapse_compose_panel(e);
			
			return;
		}
		
		var ts = new Date();
		var time = ('0' + ts.getHours()).slice(-2) + ':' + ('0' + ts.getMinutes()).slice(-2) + ':' + ('0' + ts.getSeconds()).slice(-2);
		var date = ts.getFullYear() + '-' + ('0' + (ts.getMonth()+1)).slice(-2) + '-' + ('0' + ts.getDate()).slice(-2);
		var yaml = "---\nlayout: index\ntitle: "+time+"\ndate: "+date+" "+time+"\n---\n";
		
		var blurb = yaml + f.blurb.value;
		
		var filename = "_posts/"+date+"-"+time.replace(/:/g, "")+".markdown";
		
		var url = 'https://api.github.com/repos/'+localStorage.github_username+'/burble/contents/'+filename+'?username='+localStorage.github_username;
		
		var req = new XMLHttpRequest();
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
					burble.collapse_compose_panel(e);
					
					var p = document.createElement('p');
					p.id="indicator";
					var i = document.createElement('img');
					i.src="css/assets/indicator.gif";
					p.appendChild(i);
					
					var b = document.getElementById('blurbs');
					b.insertBefore(p, b.firstChild);
					
					setTimeout(function()
					{
					    document.location.reload(true);
					}, 8000);
				}
			}
		}
	
		req.open('PUT', url);
		req.setRequestHeader("Authorization", "token "+localStorage.github_api_key);
		req.setRequestHeader("User-Agent", localStorage.github_username);
		
		data = {
			path: filename,
			content: btoa(yaml+f.blurb.value),
			message: 'post blurb',
			branch: 'gh-pages',
			committer: {name: localStorage.github_username, email: localStorage.github_email}
		};
					
		req.send(JSON.stringify(data));
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
    
    window.burble = new Burble();
    
})(window);