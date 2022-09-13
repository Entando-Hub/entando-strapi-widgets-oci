import Template from "react-mustache-template-component";

export default function TemplateComponent({ css, template, data }) {
    return (
        <>
            <Template template={template} data={data} css={css} />
        </>
    );
}
