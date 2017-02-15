/*
    Copyright (C) 2015  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

module.exports = function ImageMediaRendererModule(pb) {
    
    //pb dependencies
    var util              = pb.util;
    var BaseMediaRenderer = pb.media.renderers.BaseMediaRenderer;

    /**
     * Renders
     * @class ImageMediaRenderer
     * @constructor
     */
    function ImageMediaRenderer(){}

    /**
     * The media type supported by the provider
     * @private
     * @static
     * @property TYPE
     * @type {String}
     */
    var TYPE = 'image';

    /**
     * The list of supported extensions
     * @private
     * @static
     * @readonly
     * @property SUPPORTED
     * @type {Object}
     */
    var SUPPORTED = Object.freeze({
        jpg: {
            mime: 'image/jpg'
        },
        jpeg: {
            mime: 'image/jpeg'
        },
        png: {
            mime: 'image/png'
        },
        svg: {
            mime: 'image/svg+xml'
        },
        webp: {
            mime: 'image/webp'
        },
        gif: {
            mime: 'image/gif'
        }
    });

    /**
     * Provides the styles used by each type of view
     * @private
     * @static
     * @property STYLES
     * @type {Object}
     */
    var STYLES = Object.freeze({

        view: {
            'max-width': "100%",
            'max-height': '500px'
        },

        editor: {
        },

        post: {
        }
    });

    /**
     * Retrieves the style for the specified type of view
     * @static
     * @meethod getStyle
     * @param {String} viewType The view type calling for a styling
     * @return {Object} a hash of style properties
     */
    ImageMediaRenderer.getStyle = function(viewType) {
        return STYLES[viewType] || STYLES.view;
    };

    /**
     * Retrieves the supported media types as a hash.
     * @static
     * @method getSupportedTypes
     * @return {Object}
     */
    ImageMediaRenderer.getSupportedTypes = function() {
        var types = {};
        types[TYPE] = true;
        return types;
    };

    /**
     * Retrieves the name of the renderer.
     * @static
     * @method getName
     * @return {String}
     */
    ImageMediaRenderer.getName = function() {
        return 'ImageMediaRenderer';
    };

    /**
     * Determines if the URL to a media object is supported by this renderer
     * @static
     * @method isSupported
     * @param {String} urlStr
     * @return {Boolean} TRUE if the URL is supported by the renderer, FALSE if not
     */
    ImageMediaRenderer.isSupported = function(urlStr) {
        var ext = util.getExtension(urlStr, {lower: true, sep: '/'});
        return SUPPORTED[ext] ? true : false;
    };

    /**
     * Gets the specific type of the media resource represented by the provided URL
     * @static
     * @method getType
     * @param {String} urlStr
     * @return {String}
     */
    ImageMediaRenderer.getType = function(urlStr) {
        return ImageMediaRenderer.isSupported(urlStr) ? TYPE : null;
    }

    /**
     * Retrieves the Font Awesome icon class.  It is safe to assume that the type
     * provided will be a supported type by the renderer.
     * @static
     * @method getIcon
     * @param {String} type
     * @return {String}
     */
    ImageMediaRenderer.getIcon = function(type) {
        return 'picture-o';
    };

    /**
     * Renders the media resource via the raw URL to the resource
     * @static
     * @method renderByUrl
     * @param {String} urlStr
     * @param {Object} [options]
     * @param {Object} [options.attrs] A hash of all attributes (excluding style)
     * that will be applied to the element generated by the rendering
     * @param {Object} [options.style] A hash of all attributes that will be
     * applied to the style of the element generated by the rendering.
     * @param {Function} cb A callback where the first parameter is an Error if
     * occurred and the second is the rendering of the media resource as a HTML
     * formatted string
     */
    ImageMediaRenderer.renderByUrl = function(urlStr, options, cb) {
        ImageMediaRenderer.getMediaId(urlStr, function(err, mediaId) {
            if (util.isError(err)) {
                return cb(err);
            }
            ImageMediaRenderer.render({location: mediaId}, options, cb);
        });
    };

    /**
     * Renders the media resource via the media descriptor object.  It is only
     * guaranteed that the "location" property will be available at the time of
     * rendering.
     * @static
     * @method render
     * @param {Object} media
     * @param {String} media.location The unique resource identifier (only to the
     * media type) for the media resource
     * @param {Object} [options]
     * @param {Object} [options.attrs] A hash of all attributes (excluding style)
     * that will be applied to the element generated by the rendering
     * @param {Object} [options.style] A hash of all attributes that will be
     * applied to the style of the element generated by the rendering.
     * @param {Function} cb A callback where the first parameter is an Error if
     * occurred and the second is the rendering of the media resource as a HTML
     * formatted string
     */
    ImageMediaRenderer.render = function(media, options, cb) {
        if (util.isFunction(options)) {
            cb = options;
            options = {};
        }

        var embedUrl = ImageMediaRenderer.getEmbedUrl(media.location);
        cb(null, BaseMediaRenderer.renderSingleElementEmbed('image', embedUrl, options.attrs, options.style));
    };

    /**
     * Retrieves the source URI that will be used when generating the rendering
     * @static
     * @method getEmbedUrl
     * @param {String} mediaId The unique (only to the type) media identifier
     * @return {String} A properly formatted URI string that points to the resource
     * represented by the media Id
     */
    ImageMediaRenderer.getEmbedUrl = function(mediaId) {
        return mediaId;
    };

    /**
     * Retrieves the unique identifier from the URL provided.  The value should
     * distinguish the media resource from the others of this type and provide
     * insight on how to generate the embed URL.
     * @static
     * @method getMediaId
     */
    ImageMediaRenderer.getMediaId = function(urlStr, cb) {
        cb(null, urlStr);
    };

    /**
     * Retrieves any meta data about the media represented by the URL.
     * @static
     * @method getMeta
     * @param {String} urlStr
     * @param {Boolean} isFile indicates if the URL points to a file that was
     * uploaded to the PB server
     * @param {Function} cb A callback that provides an Error if occurred and an
     * Object if meta was collected.  NULL if no meta was collected
     */
    ImageMediaRenderer.getMeta = function(urlStr, isFile, cb) {
        var ext = util.getExtension(urlStr, {lower: true});
        var meta = util.clone(SUPPORTED[ext]);
        cb(null, meta);
    };

    /**
     * Retrieves a URI to a thumbnail for the media resource
     * @static
     * @method getThumbnail
     * @param {String} urlStr
     * @param {Function} cb A callback where the first parameter is an Error if
     * occurred and the second is the URI string to the thumbnail.  Empty string or
     * NULL if no thumbnail is available
     */
    ImageMediaRenderer.getThumbnail = function(urlStr, cb) {
        cb(null, urlStr);
    };

    /**
     * Retrieves the native URL for the media resource.  This can be the raw page
     * where it was found or a direct link to the content.
     * @static
     * @method getNativeUrl
     */
    ImageMediaRenderer.getNativeUrl = function(media) {
        return media.location;
    };

    //exports
    return ImageMediaRenderer;
};
