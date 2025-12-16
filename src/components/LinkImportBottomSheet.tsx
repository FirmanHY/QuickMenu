import React, { forwardRef } from "react";
import CustomBottomSheet, { CustomBottomSheetRef } from "./CustomBottomSheet";

import { vs } from "../utils/responsive";
import LinkImportContent from "./LinkImportContentSheet";

interface LinkImportBottomSheetProps {
    onSubmit: (url: string) => void;
    onClose: () => void;
}

const LinkImportBottomSheet = forwardRef<
    CustomBottomSheetRef,
    LinkImportBottomSheetProps
>(({ onSubmit, onClose }, ref) => {
    const handleContentSubmit = (url: string) => {
        onSubmit(url);
    };

    const handleContentCancel = () => {
        onClose();
    };

    return (
        <CustomBottomSheet ref={ref} height={vs(340)}>
            <LinkImportContent
                onSubmit={handleContentSubmit}
                onCancel={handleContentCancel}
            />
        </CustomBottomSheet>
    );
});

export default LinkImportBottomSheet;
