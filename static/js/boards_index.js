var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };
    
    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};
    
// Copped from decks_index.js
// Really should be modularized

/*
------------------------------------------------------------------------------------
deck function
------------------------------------------------------------------------------------
*/

    /*get all decks belonging to the signed in user*/
    self.get_decks = function(){
        $.get(get_decks_url,
            function(decks){
                //initialize all deck uploading status
                for(var i=0; i<decks.length; i++){
                    decks[i].is_uploading = false;
                    decks[i].editing_deck = false;
                }
                enumerate(decks);
                self.vue.curr_decks = decks;
            }
        )
    }

/*
------------------------------------------------------------------------------------
card functions
------------------------------------------------------------------------------------
*/

    //show cards belonging to the given deck
    self.get_cards = function(){
        $.get(show_cards_url,
            function (data) {
                enumerate(data);
                self.vue.curr_cards = data;
                self.vue.delete_cart = [];
                self.vue.caption_cart = [];
            })
    }

/*
------------------------------------------------------------------------------------
    Vue components
------------------------------------------------------------------------------------
*/
    
    // Using components to get JQuery binding properly
    // See https://vuejsdevelopers.com/2017/05/20/vue-js-safely-jquery-plugin/
    Vue.component('idea-card', {
        props: ['image_url', 'image_caption'],
        template: '<p class="idea-card lifted">\
                    <img v-bind:src="image_url"/>\
                    <!--Display text within image-->\
                    <span class="padded">{{image_caption}}</span>\
                  </p>',
        mounted: function() {
            // http://api.jqueryui.com/draggable/
            $(this.$el).draggable({
                stop: function(event, ui) {
                    // Stop dragging
                    // Need to force this because it gets confused by
                    // the CSS switch to absolute positioning
                    $(event.target).css('top', 0).css('left', 0);
                },
                revert: true,
                revertDuration: false
            });
        }
    });

/*
------------------------------------------------------------------------------------
Our Vue Object
------------------------------------------------------------------------------------
*/
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        data: {
            curr_decks: [],         //storeall decks of signed in user
            curr_cards: [],          //store all cards of signed in user
        },
        methods: {
            //deck functions
            get_decks: self.get_decks,

            //card functions
            get_cards: self.get_cards,
        },
    });

/*
------------------------------------------------------------------------------------
initialize values like login status, decks, and cards when user
first signs in
------------------------------------------------------------------------------------
*/
    var initialize = function(){
        $.get(login_status_url,
            function (user) {
                //get login status
                self.vue.logged_in = (user != null);
                //if user is logged in, fetch user decks and cards
                if(self.vue.logged_in){
                    self.get_decks();
                    self.get_cards();
                }
            });
    }();
    
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
