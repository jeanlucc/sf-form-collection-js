$(function () {
    var TEXT = window.TEXT || {};
    window.TEXT = TEXT;

    TEXT.TextCollection = function (collectionContainer) {
        this.$collectionContainer = $(collectionContainer);

        this.init();
    }

    TEXT.TextCollection.prototype = {
        init: function (collectionContainer, options) {
            this.collectionManager = this.$collectionContainer.manageCollection({
                'name': 'text',
                'index-placeholder': '__name__',
                'insert-method': 'before',
            })[0];

            this.$collectionContainer.on('text.before-delete', function(event) {
                this.beforeDelete(event);
            }.bind(this));

            this.$collectionContainer.on('text.before-add', function(event) {
                this.beforeAdd(event);
            }.bind(this));

            if (this.collectionManager.getHolder().children().length === 0) {
                this.collectionManager.addItem('append');
            }
        },

        beforeAdd: function(event) {
            var validItemCount = 0;
            this.collectionManager.getHolder().children().each(function(index, item) {
                if (this.isItemValid(item)) {
                    ++validItemCount;
                }
            }.bind(this));

            if (validItemCount !== this.collectionManager.getHolder().children().length) {
                event.preventDefault();
            }

            var $itemToAdd = $(event.itemToAdd);
            $itemToAdd.find('input').val('before');

            event.itemToAdd = $itemToAdd;
        },

        beforeDelete: function(event) {
            if (this.collectionManager.getHolder().children().length === 1) {
                event.preventDefault();
                $input = $(event.itemToDelete.find('input'));
                if ($input.val() !== '') {
                    $input.val('');
                }
            }
        },

        isItemValid: function(item) {
            return $(item).find('input').val() !== '';
        },
    };
});
