///<reference path="wildBattle/RouteHelper.ts"/>
///<reference path="Battle.ts"/>
/**
 * Start the game when all html elements are loaded.
 */
declare var player;
const debug = false;


document.addEventListener("DOMContentLoaded", function (event) {

    let game: Game = new Game();
    game.start();

    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });

    ko.bindingHandlers.tooltip = {
        init: function(element, valueAccessor) {
            var local = ko.utils.unwrapObservable(valueAccessor()),
                options = {};

            ko.utils.extend(options, ko.bindingHandlers.tooltip.options);
            ko.utils.extend(options, local);

            $(element).tooltip(options);

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                // $(element).tooltip("destroy");
            });
        },
        options: {
            placement: "bottom",
            trigger: "click"
        }
    };

    ko.applyBindings(Game);





});

/**
 * Main game class.
 */
class Game {
    interval;
    undergroundCounter: number;
    farmCounter: number;

    public static gameState : KnockoutObservable<GameConstants.GameState> = ko.observable(GameConstants.GameState.fighting);

    constructor() {
        (<any>window).player = Save.load();
    }

    start() {
        player.region = GameConstants.Region.kanto;
        OakItemRunner.initialize();
        this.load();

        this.interval = setInterval(this.gameTick, GameConstants.TICK_TIME);
    }

    stop() {
        clearTimeout(this.interval);
    }

    gameTick() {
        // Update tick counters
        this.undergroundCounter += GameConstants.TICK_TIME;
        this.farmCounter += GameConstants.TICK_TIME;
        Save.counter += GameConstants.TICK_TIME;

        switch (Game.gameState()) {
            case GameConstants.GameState.fighting: {
                Battle.counter += GameConstants.TICK_TIME;
                if (Battle.counter > GameConstants.BATTLE_TICK) {
                    Battle.tick();
                }
                break;
            }
            case GameConstants.GameState.gym: {
                GymBattle.counter += GameConstants.TICK_TIME;
                if (GymBattle.counter > GameConstants.BATTLE_TICK) {
                    GymBattle.tick();
                }
                GymRunner.tick();
                break;
            }
        }



        if (Save.counter > GameConstants.SAVE_TICK) {
            Save.store(player);
        }
    }

    save() {

    }

    load() {
        Battle.generateNewEnemy();
    }
}
