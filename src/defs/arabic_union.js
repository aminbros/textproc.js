var arabic_union = textproc.buildDefinition({
    map: [
        [ [ 0x0649, 0x064A, 0x06CC ], 'ي' ], // YAH
        [ [ 0x0643, 0x06A9 ], 'ك' ], // KAF
        // diacritics
        [ textproc.rangeInc(0x064B, 0x065A), textproc.IGNORE_CHAR ], 

        // numbers
        [ textproc.rangeInc('٠', '٩'), textproc.rangeInc('0', '9') ], // arabic
        [ textproc.rangeInc('۰', '۹'), textproc.rangeInc('0', '9') ] // farsi
    ]
});

//// SINGLE_EXPORT arabic_union
