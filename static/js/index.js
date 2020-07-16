// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};

// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        posts: [], // See initialization.
    };

    app.index = (a) => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;	
        for (let p of a) {
            p._idx = i++;
            // TODO: Only make the user's own posts editable.
            if(user_email === p.email){
                p.editable = true;
	        p.author = author_name;
	    }else {
                p.editable = false;
	    }
            p.edit = false;
            p.is_pending = false;
            p.error = false;
            p.original_content = p.content; // Content before an edit.
            p.server_content = p.content; // Content on the server.
        }
        return a;
    };

    app.reindex = () => {
        // Adds to the posts all the fields on which the UI relies.
        let i = 0;
        for (let p of app.vue.posts) {
            p._idx = i++;
        }
    };

    app.do_edit = (post_idx) => {
        // Handler for button that starts the edit.
        // TODO: make sure that no OTHER post is being edited.
        // If so, do nothing.  Otherwise, proceed as below.
	let flag = false;
	for(let iter = 0;iter < app.vue.posts.length;iter++){
            let pt = app.vue.posts[iter];
		if(pt.edit === true){
                    flag = true;
		    break;
		}
	}
        if(flag === false){
	    let p = app.vue.posts[post_idx];
            p.edit = true;
            p.is_pending = false;
	}
    };
// BOOYA
    app.do_cancel = (post_idx) => {
        // Handler for button that cancels the edit.
        let p = app.vue.posts[post_idx];
        if (p.id === null) {
            // If the post has not been saved yet, we delete it.
            app.vue.posts.splice(post_idx, 1);
            app.reindex();
        } else {
            // We go back to before the edit.
            p.edit = false;
            p.is_pending = false;
            p.content = p.original_content;
        }
    }

    app.do_save = (post_idx) => {
        // Handler for "Save edit" button.
        let p = app.vue.posts[post_idx];
        if (p.content !== p.server_content) {
            p.is_pending = true;
            axios.post(posts_url, {
                content: p.content,
                id: p.id,
                is_reply: p.is_reply,
		author: p.author,
            }).then((result) => {
                console.log("Received:", result.data);
		p.edit = false;
                p.is_pending = false;
	        app.init();
                // TODO: You are receiving the post id (in case it was inserted),
                // and the content.  You need to set both, and to say that
                // the editing has terminated.
            }).catch(() => {
                p.is_pending = false;
                console.log("Caught error");
                // We stay in edit mode.
            });
        } else {
            // No need to save.
            p.edit = false;
            p.original_content = p.content;
        }
    }
    app.add_post = () => {
	console.log("mouse");
        let q = {
	    id: null,
            edit: true,
            editable: true,
            content: "",
            server_content: "",
            original_content: "",
            author: author_name,
            email: user_email,
            is_reply: null,
        };
	app.vue.posts.unshift(q);
        app.reindex();
    };
    app.reply = (post_idx) => {
	console.log("reply");
        let p = app.vue.posts[post_idx];
        if (p.id !== null) {
            let q = {
                id: null,
                edit: true,
                editable: true,
                content: "",
                server_content: "",
                original_content: "",
                author: author_name,
                email: user_email,
                is_reply: p.id,
            };
	    app.vue.posts.splice(post_idx + 1, 0, q);
	    app.reindex();
        }
    };

    app.do_delete = (post_idx) => {
        let p = app.vue.posts[post_idx];
	app.vue.posts.splice(post_idx, 1);
	app.reindex();
        axios.post(delete_url, {
		content: p.content,
		id: p.id,
		is_reply: p.is_reply,
        });
    };
    // we form the dictionary of all methods, so we can assign them
    // to the vue app in a single blow.
    app.methods = {
        do_edit: app.do_edit,
        do_cancel: app.do_cancel,
        do_save: app.do_save,
        add_post: app.add_post,
        reply: app.reply,
        do_delete: app.do_delete,
    };

    // this creates the vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // and this initializes it.
    app.init = () => {
        // you should load the posts from the server.
        // this is purely debugging code.

        // todo: load the posts from the server instead.
        // we set the posts.
	let posts = [] 
	    axios.get(posts_url)
		.then((result) => {
			let i = 0;
			while(i < result.data.posts.length){
			    posts.push(result.data.posts[i]);
                            app.reindex();
			    i++;
			}

                        app.vue.posts = app.index(posts);

			console.log(app.vue.posts);
	    });
    };
    // call to the initializer.
    app.init();
};

// this takes the (empty) app object, and initializes it,
// putting all the code i
init(app);

