// @flow

import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { JaneWeb } from '../../base/styles/components/styles';
import { calcPixelByHeightRatio, calcFontSize, calcPixelByWidthRatio } from '../../base/styles';

type Props = {
    content: React$Node,
    borderColor: string,
    textColor: string,
    marginBottom: number,
    onPress: Function
};

const styles = {
    buttonStyle: {
        borderRadius: 6,
        borderWidth: 1,
        width: '100%',
        height: calcPixelByHeightRatio(51),
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: calcPixelByWidthRatio(337)
    },
    textStyle: {
        ...JaneWeb.boldFont,
        fontSize: calcFontSize(18)
    }
};

export const IntroPageButton = (props: Props) => (<TouchableOpacity
    onPress = { props.onPress }
    style = {{ ...styles.buttonStyle,
        borderColor: props.borderColor,
        marginBottom: calcPixelByHeightRatio(props.marginBottom)
    }}>
    <Text
        style = {{ ...styles.textStyle,
            color: props.textColor }}>
        {props.content}
    </Text>
</TouchableOpacity>);
