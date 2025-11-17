import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import styled from "styled-components";

// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    sans-serif;
`;

const Sidebar = styled.div`
  width: 350px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
`;

const FlowContainer = styled.div`
  flex-grow: 1;
  height: 100%;
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #1e293b;
  font-size: 1.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
`;

const DragNode = styled.div`
  padding: 12px;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  text-align: center;
  cursor: grab;
  background: white;
  font-weight: 600;
  color: #3b82f6;
  transition: all 0.2s ease;

  &:hover {
    background: #3b82f6;
    color: white;
    border-style: solid;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: ${(props) =>
    props.variant === "reset"
      ? "#6b7280"
      : props.variant === "export"
      ? "#8b5cf6"
      : "#10b981"};
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) =>
      props.variant === "reset"
        ? "#4b5563"
        : props.variant === "export"
        ? "#7c3aed"
        : "#059669"};
  }
`;

const Section = styled.div`
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #1e293b;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #64748b;
  font-size: 0.9rem;
`;

const ListItem = styled.li`
  margin-bottom: 5px;
`;

const ConnectionsArray = styled(Section)`
  max-height: 300px;
  overflow-y: auto;
`;

const ConnectionItem = styled.div`
  padding: 8px;
  margin-bottom: 6px;
  background: #f1f5f9;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #e0f2fe;
  }
`;

const DataSection = styled(Section)`
  background: #fff7ed;
  border: 1px solid #fdba74;
`;

const Pre = styled.pre`
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
`;

const CopyButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.7rem;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.8rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.8rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #64748b;

  &:hover {
    color: #374151;
  }
`;

// Initial nodes
const initialNodes = [
  {
    id: "1",
    type: "default",
    position: { x: 100, y: 100 },
    data: {
      label: "Initial Button",
      type: "initial",
      createdAt: new Date().toISOString(),
    },
    style: {
      background: "#10b981",
      color: "white",
      border: "2px solid #059669",
      borderRadius: "8px",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "bold",
    },
  },
];

const initialEdges = [];

let nodeId = 2;
const getNodeId = () => `${nodeId++}`;

// Edge Editor Component
const EdgeEditor = ({ selectedEdge, edges, onUpdateConnection, onClose }) => {
  if (!selectedEdge) {
    return (
      <Section>
        <SectionTitle>Connection Editor</SectionTitle>
        <div
          style={{ color: "#64748b", fontSize: "0.9rem", textAlign: "center" }}
        >
          Click on a connection to edit
        </div>
        <List>
          {edges.map((edge) => (
            <ListItem
              key={edge.id}
              style={{
                cursor: "pointer",
                padding: "5px",
                background: "#f8fafc",
                borderRadius: "4px",
                marginBottom: "8px",
              }}
              onClick={() => onUpdateConnection(edge.id, {}, true)}
            >
              {edge.source} → {edge.target}
              <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                {edge.data?.buttonLabel || "No label"}
              </div>
            </ListItem>
          ))}
        </List>
      </Section>
    );
  }

  const currentEdge = edges.find((edge) => edge.id === selectedEdge);

  return (
    <Section>
      <SectionTitle>
        Edit Connection
        <CloseButton onClick={onClose}>✕</CloseButton>
      </SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div>
          <label
            style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block" }}
          >
            Button Name:
          </label>
          <Input
            type="text"
            value={currentEdge?.data?.buttonName || ""}
            onChange={(e) =>
              onUpdateConnection(selectedEdge, {
                buttonName: e.target.value,
              })
            }
            placeholder="Enter button name..."
          />
        </div>
        <div>
          <label
            style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block" }}
          >
            Button Label:
          </label>
          <Input
            type="text"
            value={currentEdge?.data?.buttonLabel || ""}
            onChange={(e) =>
              onUpdateConnection(selectedEdge, {
                buttonLabel: e.target.value,
              })
            }
            placeholder="Enter button label..."
          />
        </div>
        <div>
          <label
            style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block" }}
          >
            Connection Type:
          </label>
          <Select
            value={currentEdge?.data?.connectionType || "navigation"}
            onChange={(e) =>
              onUpdateConnection(selectedEdge, {
                connectionType: e.target.value,
              })
            }
          >
            <option value="navigation">Navigation</option>
            <option value="action">Action</option>
            <option value="conditional">Conditional</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </Select>
        </div>
        <div>
          <label
            style={{ fontSize: "0.8rem", fontWeight: "bold", display: "block" }}
          >
            Priority:
          </label>
          <Select
            value={currentEdge?.data?.priority || 1}
            onChange={(e) =>
              onUpdateConnection(selectedEdge, {
                priority: parseInt(e.target.value),
              })
            }
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </Select>
        </div>
        <div
          style={{
            padding: "10px",
            background: "#f8fafc",
            borderRadius: "4px",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
            <strong>Connection:</strong> {currentEdge?.source} →{" "}
            {currentEdge?.target}
          </div>
        </div>
      </div>
    </Section>
  );
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [flowData, setFlowData] = useState({
    flowId: `flow_${Date.now()}`,
    flowName: "Untitled Flow",
    nodes: [],
    connections: [],
  });

  console.log("flowData----->", flowData);

  // Update structured data whenever nodes or edges change
  useEffect(() => {
    const structuredNodes = nodes.map((node) => ({
      nodeId: node.id,
      templateId: node.data.templateId || `template_${node.id}`,
      templateName: node.data.templateName || node.data.label,
      displayName: node.data.label,
      nodeType: node.data.type || "regular",
      position: node.position,
      style: node.style,
      properties: {
        isInitial: node.data.type === "initial",
        isFinal: node.data.type === "final",
        hasButtons: node.data.hasButtons || false,
      },
      timestamps: {
        createdAt: node.data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }));

    const connections = edges.map((edge) => {
      const sourceNode = nodes.find((node) => node.id === edge.source);
      const targetNode = nodes.find((node) => node.id === edge.target);

      return {
        connectionId: edge.id,
        source: {
          templateId:
            sourceNode?.data.templateId || `template_${sourceNode?.id}`,
          templateName: sourceNode?.data.templateName || sourceNode?.data.label,
          buttonName: edge.data?.buttonName || "default_button",
          buttonLabel: edge.data?.buttonLabel || sourceNode?.data.label,
        },
        target: {
          templateId:
            targetNode?.data.templateId || `template_${targetNode?.id}`,
          templateName: targetNode?.data.templateName || targetNode?.data.label,
        },
        connectionType: edge.data?.connectionType || "navigation",
        priority: edge.data?.priority || 1,
      };
    });

    setFlowData((prev) => ({
      ...prev,
      nodes: structuredNodes,
      connections,
    }));
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        data: {
          buttonName: `button_${params.source}_to_${params.target}`,
          buttonLabel: "Navigate",
          connectionType: "navigation",
          priority: 1,
          conditions: {},
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) {
        return;
      }

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: getNodeId(),
        type: "default",
        position,
        data: {
          label: `Step ${nodes.length}`,
          templateId: `template_${getNodeId()}`,
          templateName: `step_${nodes.length}`,
          type: "regular",
          hasButtons: true,
          createdAt: new Date().toISOString(),
        },
        style: {
          background: "#3b82f6",
          color: "white",
          border: "2px solid #1d4ed8",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: "bold",
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, nodes.length]
  );

  const addButton = useCallback(() => {
    const newNode = {
      id: getNodeId(),
      type: "default",
      position: {
        x: Math.random() * 300,
        y: Math.random() * 300,
      },
      data: {
        label: `Step ${nodes.length}`,
        templateId: `template_${getNodeId()}`,
        templateName: `step_${nodes.length}`,
        type: "regular",
        hasButtons: true,
        createdAt: new Date().toISOString(),
      },
      style: {
        background: "#3b82f6",
        color: "white",
        border: "2px solid #1d4ed8",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "bold",
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, nodes.length]);

  const updateConnectionData = useCallback(
    (edgeId, updates, setAsSelected = false) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, data: { ...edge.data, ...updates } }
            : edge
        )
      );

      if (setAsSelected) {
        setSelectedEdgeId(edgeId);
      }
    },
    [setEdges]
  );

  const addFinalButton = useCallback(() => {
    const finalNode = {
      id: getNodeId(),
      type: "default",
      position: { x: 200, y: 300 },
      data: {
        label: "Final Button",
        templateId: `template_final_${getNodeId()}`,
        templateName: "final_step",
        type: "final",
        hasButtons: false,
        createdAt: new Date().toISOString(),
      },
      style: {
        background: "#ef4444",
        color: "white",
        border: "2px solid #dc2626",
        borderRadius: "8px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "bold",
      },
    };
    setNodes((nds) => nds.concat(finalNode));
  }, [setNodes]);

  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    setSelectedEdgeId(null);
  }, [setNodes, setEdges]);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flow-data-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [flowData]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(flowData, null, 2));
    alert("Flow data copied to clipboard!");
  }, [flowData]);

  const handleEdgeClick = useCallback((event, edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  const handleCloseEditor = useCallback(() => {
    setSelectedEdgeId(null);
  }, []);

  return (
    <AppContainer>
      <Sidebar>
        <div>
          <Title>Button Flow Builder</Title>
          <Subtitle>Create, connect, and export flow data</Subtitle>
        </div>

        <DragNode
          onDragStart={(event) => {
            event.dataTransfer.setData("application/reactflow", "default");
            event.dataTransfer.effectAllowed = "move";
          }}
          draggable
        >
          📝 Drag to Add Button
        </DragNode>

        <ButtonContainer>
          <ActionButton onClick={addButton}>➕ Add Step Button</ActionButton>
          <ActionButton onClick={addFinalButton}>
            🎯 Add Final Button
          </ActionButton>
          <ActionButton onClick={resetFlow} variant="reset">
            🔄 Reset Flow
          </ActionButton>
          <ActionButton onClick={exportData} variant="export">
            💾 Export JSON
          </ActionButton>
        </ButtonContainer>

        {/* Edge Editor */}
        <EdgeEditor
          selectedEdge={selectedEdgeId}
          edges={edges}
          onUpdateConnection={updateConnectionData}
          onClose={handleCloseEditor}
        />

        <ConnectionsArray>
          <SectionTitle>
            Connections ({flowData.connections.length})
            <CopyButton onClick={copyToClipboard}>Copy</CopyButton>
          </SectionTitle>
          {flowData.connections.length === 0 ? (
            <div
              style={{
                color: "#64748b",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              No connections yet
            </div>
          ) : (
            flowData.connections.map((connection) => (
              <ConnectionItem
                key={connection.connectionId}
                style={{
                  background:
                    selectedEdgeId === connection.connectionId
                      ? "#e0f2fe"
                      : "#f1f5f9",
                  borderLeftColor:
                    selectedEdgeId === connection.connectionId
                      ? "#0369a1"
                      : "#3b82f6",
                }}
                onClick={() => setSelectedEdgeId(connection.connectionId)}
              >
                <div>
                  <strong>{connection.source.buttonLabel}</strong>
                  <span style={{ color: "#64748b", margin: "0 8px" }}>→</span>
                  <strong>{connection.target.templateName}</strong>
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Type: {connection.connectionType} | Button:{" "}
                  {connection.source.buttonName} | Priority:{" "}
                  {connection.priority || 1}
                </div>
              </ConnectionItem>
            ))
          )}
        </ConnectionsArray>
      </Sidebar>

      <FlowContainer onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={handleEdgeClick}
          fitView
        >
          <MiniMap
            nodeColor={(node) => {
              if (node.data.type === "initial") return "#10b981";
              if (node.data.type === "final") return "#ef4444";
              return "#3b82f6";
            }}
          />
          <Controls />
          <Background />
        </ReactFlow>
      </FlowContainer>
    </AppContainer>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}

export default App;
