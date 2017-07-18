var Config = {
    colors: {
        theme: '#bd1c1b',
        themeDarker: '#961a19'
    },
    options: [
        {
            key: 'hair_color',
            type: 'multiple',
            options: ['blonde', 'brown', 'black', 'blue', 'pink', 'purple', 'green', 'red', 'silver', 'white', 'orange', 'aqua', 'grey'],
            offset: 0,
            prob: [0.0769230769,  0.0769230769,  0.0769230769,  0.0769230769,  0.0769230769,
                0.0769230769,  0.0769230769,  0.0769230769,  0.0769230769,  0.0769230769,
                0.0769230769,  0.0769230769,  0.0769230769]
        },
        {
            key: 'hair_style',
            type: 'multiple',
            options: ['long_hair', 'short_hair', 'twin_tail',  'drill_hair', 'ponytail'],
            offset: 13,
            prob: [0.75,  0.75,  0.75,  0.75,  0.75]
        },
        {
            key: 'blush',
            type: 'binary',
            offset: 18,
            prob: 0.75
        },
        {
            key: 'smile',
            type: 'binary',
            offset: 19            ,
            prob: 0.75
        },
        {
            key: 'open_mouth',
            type: 'binary',
            offset: 20,
            prob: 0.75
        },
        {
            key: 'hat',
            type: 'binary',
            offset: 21,
            prob: 0.75
        },
        {
            key: 'ribbon',
            type: 'binary',
            offset: 22,
            prob: 0.75
        },
        {
            key: 'glasses',
            type: 'binary',
            offset: 23,
            prob: 0.75
        },
        {
            key: 'eye_color',
            type: 'multiple',
            options: ['blue', 'red', 'brown', 'green', 'purple', 'yellow', 'pink', 'aqua', 'black', 'orange'],
            offset: 24,
            prob: [0.1,  0.1,  0.1,  0.1,  0.1,
                0.1 ,  0.1,  0.1,  0.1,  0.1]
        }
    ],
    gan: {
        noiseLength: 128,
        labelLength: 34,
        imageWidth: 128,
        imageHeight: 128,
        model: '/models/model_resnet_with_condition_128_full_0'
    },
    stat: {
        enabled: true,
        urlPrefix: '/api/stat'
    }
};

export default Config