import sidbarProvider from './sidbar';
import editorProvider from './editor';

const providers = [editorProvider, sidbarProvider];

export default function Provider(props: any) {
    return providers.reduceRight(
        (children, Parent) => <Parent>{children}</Parent>,
        props.children
    );
}
