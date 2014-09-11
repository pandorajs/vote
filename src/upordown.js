define(function(require, exports, module) {
    /**
     * 顶踩
     *
     * @module Vote
     */
    'use strict';

    var $ = require('$'),
        Core = require('./core');

    /**
     * 顶踩
     * @class UpOrDown
     * @extends core
     * @constructs
     */
    var UpOrDown = Core.extend({

        defaults: {
            url: 'http://hits.17173.com/support/support_opb.php'
        },

        /**
         * 支持
         * @param  {function} callBack 回调函数
         */
        support: function(callBack) {
            var self = this;
            self.params.action = '1';
            self.state(Core.STATE.SENDING);
            self.dataServer(function(data) {
                callBack.call(self, data);
                self.fire('support', data);
            });
        },

        /**
         * 反对
         * @param  {function} callBack 回调函数
         */
        oppose: function(callBack) {
            var self = this;
            self.params.action = '2';
            self.state(Core.STATE.SENDING);
            self.dataServer(function(data) {
                callBack.call(self, data);
                self.fire('oppose', data);
            });
        },

        /**
         * 解析数据
         * @param  {Object} data 原始数据
         * @return {Object}      加工后的数据
         * @private
         */
        parseData: function(data) {
            var support = parseInt(data.support, 10);
            var oppose = parseInt(data.oppose, 10);
            var total = support + oppose;
            var suPercent = support / total * 100;
            return {
                original: data,
                support: {
                    count: support,
                    percent: suPercent
                },
                oppose: {
                    count: oppose,
                    percent: 100 - suPercent
                },
                max: Math.max(oppose, support),
                total: total,
                webId: this.option('webId')
            };
        }

    });

    module.exports = UpOrDown;

});
