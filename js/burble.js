(function (window) {

    function Burble()
    {
        var panel = document.createElement('div');
        panel.id = 'burble';
        
        var compose_link = document.createElement('a');
        compose_link.href='#';
        compose_link.innerHTML = 'compose';
        compose_link.addEventListener('click', this.expand_compose_panel);
        
        panel.appendChild(compose_link);
        
        
        
        document.body.insertBefore(panel, document.body.firstChild)
    }
    
    Burble.prototype.expand_compose_panel = function(e)
    {
        e.preventDefault();   
        var f = document.createElement('form');
        
        var t = burble.create_text_input('username', 'GitHub Username');
        f.appendChild(t);
        
        t = burble.create_text_input('email', 'E-mail Address');
        f.appendChild(t);
        
        t = burble.create_password_input('token', 'API Token');
        f.appendChild(t);
        
        
        t = document.createElement('textarea');
        t.id='blurb';
        t.cols = '25';
        t.rows = '8';
        
        f.appendChild(t);
        
        var b = document.createElement('input');
        b.type = 'submit';
        b.value = 'post';
        f.appendChild(b);
        
        f.addEventListener('submit', burble.submit_blurb);
        
        var b = document.getElementById('burble')
        b.appendChild(f);
        var a = b.firstChild;
        a.removeEventListener('click', burble.expand_compose_panel);
        a.innerHTML = 'cancel';
        a.addEventListener('click', burble.collapse_compose_panel);
    }
    
    Burble.prototype.collapse_compose_panel = function(e)
    {
        e.preventDefault();
        
        var b = document.getElementById('burble');
        var a = b.firstChild;
        var f = b.getElementsByTagName('form')[0];
        
        b.removeChild(f);
        
        a.removeEventListener('click', burble.collapse_compose_panel);
        a.innerHTML = 'compose';
        a.addEventListener('click', burble.expand_compose_panel);
    }
    
    Burble.prototype.submit_blurb = function(e)
    {
        e.preventDefault();
        var b = document.getElementById('burble');
        var f = b.getElementsByTagName('form')[0];
        
        if (f.username.value != '' && f.email.value != '' && f.token.value != '')
        {
            var ts = new Date();
            var time = ('0' + ts.getHours()).slice(-2) + ':' + ('0' + ts.getMinutes()).slice(-2) + ':' + ('0' + ts.getSeconds()).slice(-2);
            var date = ts.getFullYear() + '-' + ('0' + (ts.getMonth()+1)).slice(-2) + '-' + ('0' + ts.getDate()).slice(-2);
            var yaml = "---\nlayout: index\ntitle: "+time+"\ndate: "+date+" "+time+"\n---\n";
            
            var blurb = yaml + f.blurb.value;
            
            var filename = "_posts/"+date+"-"+time.replace(/:/g, "")+".markdown";
            
            var url = 'https://api.github.com/repos/'+f.username.value+'/burble/contents/'+filename
            
            console.log(filename, yaml+f.blurb.value);
            var req = new XMLHttpRequest()
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
                    }
                }
            }
        
            req.open('PUT', url)
            req.setRequestHeader("Authorization", "token "+f.token.value);
            req.setRequestHeader("User-Agent", f.username.value);
            req.setRequestHeader("X-User-Agent", f.username.value);
            
            data = {
				path: filename,
				content: btoa(yaml+f.blurb.value),
				message: 'post blurb',
				branch: 'gh-pages',
				committer: {name: f.username.value, email: f.email.value}
			}
                        
            req.send(JSON.stringify(data))
            
            
        }
    }
    
    Burble.prototype.create_text_input = function(id, label)
    {
        var ip = document.createElement('input');
        ip.type = 'text';
        ip.title = label;
        ip.id = id;
        ip.value = label;
        ip.style.color = '#ccc'
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
        ip.style.color = '#ccc'
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