// @flow

import Spinner from '@atlaskit/spinner';
import { jitsiLocalStorage } from '@jitsi/js-utils/jitsi-local-storage';
import React, { useState, useEffect, useCallback } from 'react';
import uuid from 'uuid';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { Icon, IconCloseSmall, IconPlusCircle } from '../../base/icons';
import { connect } from '../../base/redux';
import { Tooltip } from '../../base/tooltip';
import { toggleBackgroundEffect } from '../actions';
import { resizeImage, toDataURL } from '../functions';
import logger from '../logger';

type Image = {
    tooltip?: string,
    id: string,
    src: string
}

// The limit of virtual background uploads is 24. When the number
// of uploads is 25 we trigger the deleteStoredImage function to delete
// the first/oldest uploaded background.
const backgroundsLimit = 25;
const images: Array<Image> = [
    {
        tooltip: 'image1',
        id: '1',
        src: 'images/virtual-background/background-1.jpg'
    },
    {
        tooltip: 'image2',
        id: '2',
        src: 'images/virtual-background/background-2.jpg'
    },
    {
        tooltip: 'image3',
        id: '3',
        src: 'images/virtual-background/background-3.jpg'
    },
    {
        tooltip: 'image4',
        id: '4',
        src: 'images/virtual-background/background-4.jpg'
    },
    {
        tooltip: 'image5',
        id: '5',
        src: 'images/virtual-background/background-5.jpg'
    },
    {
        tooltip: 'image6',
        id: '6',
        src: 'images/virtual-background/background-6.jpg'
    },
    {
        tooltip: 'image7',
        id: '7',
        src: 'images/virtual-background/background-7.jpg'
    }
];
type Props = {

    /**
     * Returns the selected thumbnail identifier.
     */
    _selectedThumbnail: string,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

const onError = event => {
    event.target.style.display = 'none';
};

/**
 * Renders virtual background dialog.
 *
 * @returns {ReactElement}
 */
function VirtualBackground({ _selectedThumbnail, dispatch, t }: Props) {
    const localImages = jitsiLocalStorage.getItem('virtualBackgrounds');
    const [ storedImages, setStoredImages ] = useState<Array<Image>>((localImages && JSON.parse(localImages)) || []);
    const [ loading, setLoading ] = useState(false);

    // const uploadImageButton: Object = useRef(null);

    const deleteStoredImage = useCallback(e => {
        const imageId = e.currentTarget.getAttribute('data-imageid');

        setStoredImages(storedImages.filter(item => item.id !== imageId));
    }, [ storedImages ]);

    /**
     * Updates stored images on local storage.
     */
    useEffect(() => {
        try {
            jitsiLocalStorage.setItem('virtualBackgrounds', JSON.stringify(storedImages));
        } catch (err) {
            // Preventing localStorage QUOTA_EXCEEDED_ERR
            err && deleteStoredImage(storedImages[0]);
        }
        if (storedImages.length === backgroundsLimit) {
            setStoredImages(storedImages.slice(1));
        }
    }, [ storedImages ]);

    const enableBlur = useCallback(async () => {
        setLoading(true);
        await dispatch(
            toggleBackgroundEffect({
                backgroundType: 'blur',
                enabled: true,
                blurValue: 25,
                selectedThumbnail: 'blur'
            })
        );
        setLoading(false);
    }, [ dispatch ]);

    const enableBlurKeyPress = useCallback(e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            enableBlur();
        }
    }, [ enableBlur ]);

    const enableSlideBlur = useCallback(async () => {
        setLoading(true);
        await dispatch(
            toggleBackgroundEffect({
                backgroundType: 'blur',
                enabled: true,
                blurValue: 8,
                selectedThumbnail: 'slight-blur'
            })
        );
        setLoading(false);
    }, [ enableBlur ]);

    const enableSlideBlurKeyPress = useCallback(e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            enableSlideBlur();
        }
    }, [ enableBlur ]);

    const removeBackground = useCallback(async () => {
        setLoading(true);
        await dispatch(
            toggleBackgroundEffect({
                enabled: false,
                selectedThumbnail: 'none'
            })
        );
        setLoading(false);
    }, [ dispatch ]);

    const setUploadedImageBackground = useCallback(async e => {
        const imageId = e.currentTarget.getAttribute('data-imageid');
        const image = storedImages.find(img => img.id === imageId);

        if (image) {
            setLoading(true);
            await dispatch(toggleBackgroundEffect({
                backgroundType: 'image',
                enabled: true,
                url: image.src,
                selectedThumbnail: image.id
            }));
            setLoading(false);
        }
    }, [ dispatch, storedImages ]);

    const setImageBackground = useCallback(async e => {
        const imageId = e.currentTarget.getAttribute('data-imageid');
        const image = images.find(img => img.id === imageId);

        if (image) {
            setLoading(true);
            const url = await toDataURL(image.src);

            await dispatch(
                toggleBackgroundEffect({
                    backgroundType: 'image',
                    enabled: true,
                    url,
                    selectedThumbnail: image.id
                })
            );
            setLoading(false);
        }
    }, [ dispatch ]);

    const uploadImage = useCallback(async e => {
        const reader = new FileReader();
        const imageFile = e.target.files;

        reader.readAsDataURL(imageFile[0]);
        reader.onload = async () => {
            const url = await resizeImage(reader.result);
            const uuId = uuid.v4();

            setLoading(true);
            setStoredImages([
                ...storedImages,
                {
                    id: uuId,
                    src: url
                }
            ]);
            await dispatch(
                toggleBackgroundEffect({
                    backgroundType: 'image',
                    enabled: true,
                    url,
                    selectedThumbnail: uuId
                })
            );
            setLoading(false);
        };
        reader.onerror = () => {
            setLoading(false);
            logger.error('Failed to upload virtual image!');
        };
    }, [ dispatch, storedImages ]);

    const removeBackgroundKeyPress = useCallback(e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            removeBackground();
        }
    }, [ removeBackground ]);

    const setImageBackgroundKeyPress = useCallback(e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setImageBackground(e);
        }
    }, [ setImageBackground ]);

    const setUploadedImageBackgroundKeyPress = useCallback(e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setUploadedImageBackground(e);
        }
    }, [ setUploadedImageBackground ]);

    const deleteStoredImageKeyPress = useCallback(e => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            deleteStoredImage(e);
        }
    }, [ deleteStoredImage ]);

    /*
        const uploadImageKeyPress = useCallback(e => {
            if (uploadImageButton.current && (e.key === ' ' || e.key === 'Enter')) {
                e.preventDefault();
                uploadImageButton.current.click();
            }
        }, [ uploadImageButton.current ]); */

    return (
        <Dialog
            hideCancelButton = { true }
            submitDisabled = { true }
            titleKey = { 'virtualBackground.title' }
            width = '640px'>
            {loading ? (
                <div className = 'virtual-background-loading'>
                    <span className = 'loading-content-text'>{t('virtualBackground.pleaseWait')}</span>
                    <Spinner
                        isCompleting = { false }
                        size = 'medium' />
                </div>
            ) : (
                <div>
                    <label
                        className = 'file-upload-label'
                        htmlFor = 'file-upload'>
                        <Icon
                            className = { 'add-background' }
                            size = { 20 }
                            src = { IconPlusCircle } />
                        {t('virtualBackground.addBackground')}
                    </label>
                    <input
                        accept = 'image/*'
                        className = 'file-upload-btn'
                        id = 'file-upload'
                        onChange = { uploadImage }
                        type = 'file' />
                    <div className = 'virtual-background-dialog'>
                        {images.map(image => (
                            <Tooltip
                                content = { image.tooltip && t(`virtualBackground.${image.tooltip}`) }
                                key = { image.id }
                                position = { 'top' }>
                                <img
                                    alt = { image.tooltip && t(`virtualBackground.${image.tooltip}`) }
                                    className = { _selectedThumbnail === image.id ? 'thumbnail-selected'
                                        : 'thumbnail' }
                                    data-imageid = { image.id }
                                    onClick = { setImageBackground }
                                    onError = { onError }
                                    onKeyPress = { setImageBackgroundKeyPress }
                                    role = 'button'
                                    src = { image.src }
                                    tabIndex = { 0 } />
                            </Tooltip>
                        ))}
                    </div>

                    <div className = 'virtual-background-dialog'>
                        <Tooltip
                            content = { t('virtualBackground.removeBackground') }
                            position = { 'top' }>
                            <div
                                aria-label = { t('virtualBackground.removeBackground') }
                                className = { _selectedThumbnail === 'none' ? 'none-selected'
                                    : 'virtual-background-none' }
                                onClick = { removeBackground }
                                onKeyPress = { removeBackgroundKeyPress }
                                role = 'button'
                                tabIndex = { 0 } >
                                {t('virtualBackground.none')}
                            </div>
                        </Tooltip>
                        <Tooltip
                            content = { t('virtualBackground.slightBlur') }
                            position = { 'top' }>
                            <div
                                aria-label = { t('virtualBackground.slightBlur') }
                                className = { _selectedThumbnail === 'slight-blur'
                                    ? 'slight-blur-selected' : 'slight-blur' }
                                onClick = { enableSlideBlur }
                                onKeyPress = { enableSlideBlurKeyPress }
                                role = 'button'
                                tabIndex = { 0 }>
                                {t('virtualBackground.slightBlur')}
                            </div>
                        </Tooltip>
                        <Tooltip
                            content = { t('virtualBackground.blur') }
                            position = { 'top' }>
                            <div
                                aria-label = { t('virtualBackground.blur') }
                                className = { _selectedThumbnail === 'blur' ? 'blur-selected' : 'blur' }
                                onClick = { enableBlur }
                                onKeyPress = { enableBlurKeyPress }
                                role = 'button'
                                tabIndex = { 0 }>
                                {t('virtualBackground.blur')}
                            </div>
                        </Tooltip>

                        {images.map(image => (
                            <Tooltip
                                content = { image.tooltip && t(`virtualBackground.${image.tooltip}`) }
                                key = { image.id }
                                position = { 'top' }>
                                <img
                                    alt = { image.tooltip && t(`virtualBackground.${image.tooltip}`) }
                                    className = { _selectedThumbnail === image.id ? 'thumbnail-selected' : 'thumbnail' }
                                    data-imageid = { image.id }
                                    onClick = { setImageBackground }
                                    onError = { onError }
                                    onKeyPress = { setImageBackgroundKeyPress }
                                    role = 'button'
                                    src = { image.src }
                                    tabIndex = { 0 } />
                            </Tooltip>
                        ))}
                        {storedImages.map((image, index) => (
                            <div
                                className = { 'thumbnail-container' }
                                key = { image.id }>
                                <img
                                    alt = { t('virtualBackground.uploadedImage', { index: index + 1 }) }
                                    className = { _selectedThumbnail === image.id ? 'thumbnail-selected' : 'thumbnail' }
                                    data-imageid = { image.id }
                                    onClick = { setUploadedImageBackground }
                                    onError = { onError }
                                    onKeyPress = { setUploadedImageBackgroundKeyPress }
                                    role = 'button'
                                    src = { image.src }
                                    tabIndex = { 0 } />

                                <Icon
                                    ariaLabel = { t('virtualBackground.deleteImage') }
                                    className = { 'delete-image-icon' }
                                    data-imageid = { image.id }
                                    onClick = { deleteStoredImage }
                                    onKeyPress = { deleteStoredImageKeyPress }
                                    role = 'button'
                                    size = { 15 }
                                    src = { IconCloseSmall }
                                    tabIndex = { 0 } />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Dialog>
    );
}

/**
 * Maps (parts of) the redux state to the associated props for the
 * {@code VirtualBackground} component.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 *     _selectedThumbnail: string
 * }}
 */
function _mapStateToProps(state): Object {
    return {
        _selectedThumbnail: state['features/virtual-background'].selectedThumbnail
    };
}

export default translate(connect(_mapStateToProps)(VirtualBackground));
