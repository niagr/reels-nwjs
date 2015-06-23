/// <reference path="./MovieItem.ts"/>
/// <reference path="./SearchBox.ts"/>
/// <reference path="./defs/jquery.d.ts"/>



// TODO: Remove this prototype
// class Controller {
//
// }

interface IGenre {
    id: number;
    name: string;
}



// This object controls the user interface
class GUIController {


    private controller: Controller;


    // list of MovieItems added to the GUIController
    private movie_item_list: MovieItem[];


    private $container: JQuery;


    private main_view: ListView;


    private $content_container: JQuery;


    private $player: JQuery;


    private $sidebar: JQuery;


    private $toolbar: JQuery;


    private searchbox: SearchBox;


    private searchview: ListView;

    private genreview: ListView;

    private $genre_filter: JQuery;

    private current_view: string; // TODO: make this into enum


    private playing: boolean;

    private genres_list : IGenre

    constructor (controller) {

        var that = this;

    	  this.controller = controller;

        this.movie_item_list = [];

        this.$container = $('#container');

        this.main_view = new ListView();

        this.$content_container = $('#content');

        this.$player = $('<video class="player"></video');

        this.$sidebar = $('#sidebar');

        // public for debugging purposes
        this.$toolbar = $('#toolbar');

        this.searchbox = new SearchBox((query: string) => this.search(query));

        this.searchview = new ListView();

        this.genreview = new ListView();

        this.$genre_filter = $('#genres-list');

        console.log(this.$genre_filter);

        this.current_view = 'listview';

        this.playing = false;

        this.init_ui();

    }

	private init_ui () {

        this.$toolbar.append(this.searchbox.$main_container);

        $("#add-button").click(() => {
			Platform.fs.chooseEntry("directory", (entry: Platform.fs.Entry) => {
				console.log("selected directory " + entry.get_full_path());
				this.controller.load_new_movies_from_dir(entry);
			}, undefined);  // TODO: Add Error handling
		});

        $("#close-button").click(function(event) {
            window.close();
        });

        $('#expand-button').click((event) => {
            this.expand_sidebar();
        });

        this.$content_container.append(this.main_view.$main_container);

        var add_genre_filter_item = (genre: IGenre) => {
            var $genre_filer_item = $('<li>' + genre.name + '</li>');
            $genre_filer_item.click((ev) => {
                this.show_genre(genre);
                console.log("clicked" + genre.name);
            });
            this.$genre_filter.append($genre_filer_item);
        }
        add_genre_filter_item({
            id: -1,
            name: "All"
        });
        this.controller.genres.forEach(add_genre_filter_item);

	}

    public search (query: string) {

        this.searchview.clear();
        if (query == '') {
            this.toggle_view('listview');
        } else {
            this.toggle_view('searchview');
            var regex = new RegExp(query, 'i');
            this.movie_item_list.forEach((movie_item: MovieItem, index, list) => {
                if (regex.test(movie_item.movie.movie_info.title)) {
                    this.searchview.add_item(movie_item);
                }
            });
        }

    }

    private show_genre (req_genre: IGenre) {
        this.genreview.clear();
        if (req_genre.name == 'All') {
            this.toggle_view('listview');
        } else {
            this.toggle_view('genreview');
            this.movie_item_list.forEach((movie_item: MovieItem) => {
                var added = false;
                movie_item.movie.movie_info.genres.forEach((movie_genre: IGenre) => {
                    if (added == false && req_genre.id == movie_genre.id) {
                        this.genreview.add_item(movie_item);
                        added = true;
                    }
                });
            })
        }

    }


    private toggle_view (view: string) {

        var add = (list_view: ListView) => {
            this.current_view = view;
            this.$content_container.append(list_view.$main_container);
        }

        this.$content_container.children().detach();

        switch (view) {
            case 'listview': add(this.main_view);
                break;
            case 'searchview': add(this.searchview);
                break;
            case 'genreview': add(this.genreview);
        }

    }




    private expand_sidebar () {
        $('#toolbar, #content').toggleClass('sidebar-collapsed');
        $('#sidebar, #toolbar, #content').toggleClass('sidebar-expanded');
    }

    public add_movie_item (movie: Movie) {

        var movie_item = new MovieItem(movie, {
            play: this.play_movie,
            stop: this.stop_movie,
            open_dir: this.open_containing_directory,
            open_imdb_page: this.open_imdb_page
        });

        this.movie_item_list.push(movie_item);

        this.main_view.add_item(movie_item);

    }

    private play_movie (movie_item: MovieItem) {

        console.log("aaaaaaaaaaaaaaaaa");
        var gui = require('nw.gui');
        gui.Shell.openItem(movie_item.movie.video_file.get_full_path());

    }

    private open_containing_directory (movie_item: MovieItem) {
        var gui = require('nw.gui');
        gui.Shell.openItem(movie_item.movie.video_file.get_directory_path());
    }

    private open_imdb_page (movie_item: MovieItem) {
        const IMDB_BASE_URL = "http://www.imdb.com/title/";
        var gui = require('nw.gui');
        gui.Shell.openItem( IMDB_BASE_URL + movie_item.movie.movie_info.imdb_id);
    }


    private stop_movie () {

        // TODO: Remove this dead code
        // if (this.playing) {
        //     this.$player.get(0).pause();
        //     this.$player.detach();
        //     this.$container.appendTo('body');
        //     this.playing = false;
        // }

    }


}
