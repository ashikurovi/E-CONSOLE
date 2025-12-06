import React, { useMemo } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./RichTextEditor.css";

const RichTextEditor = ({
    placeholder,
    label,
    className = "",
    value = "",
    onChange,
    error,
    disabled = false,
    height = "300px",
    ...rest
}) => {

    // Quill modules configuration
    const modules = useMemo(
        () => ({
            toolbar: [
                [{ header: [1, 2, 3, 4, 5, 6, false] }],
                [{ font: [] }],
                [{ size: [] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                ],
                ["link", "image", "video"],
                [{ color: [] }, { background: [] }],
                [{ align: [] }],
                ["clean"],
            ],
            clipboard: {
                matchVisual: false,
            },
        }),
        []
    );

    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "video",
        "color",
        "background",
        "align",
    ];

    const wrapperClassNames = `flex flex-col gap-2 ${className}`.trim();

    const editorClassNames = `rich-text-editor-wrapper ${error ? "rich-text-editor-error" : ""
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`.trim();

    return (
        <div className={wrapperClassNames}>
            {label && (
                <label className="text-black/50 dark:text-white/50 text-sm ml-1">
                    {label}
                </label>
            )}
            <div className={editorClassNames} style={{ "--editor-height": height }}>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                    readOnly={disabled}
                    {...rest}
                />
            </div>
            {error && (
                <span className="text-red-500 text-xs ml-1">{error.message}</span>
            )}
        </div>
    );
};

export default RichTextEditor;

