import React from "react";

class MyComponent extends React.Component {
    render() {
        let name = "Hung Tran";
        console.log(this.props.count)
        return (
            <div>
                {console.log("Hello world!")}
                hello my component, My name is {name}
            </div>
        )
    }
}

export default MyComponent;
