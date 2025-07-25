import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  InputGroup,
  Modal,
  Table,
  Alert,
  Navbar,
  Nav,
  Card,
  Badge,
  Spinner
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import iconx from '../Resources/iconx.png';
import iconssearch from '../Resources/iconssearch.png';
import iconsedit from '../Resources/iconsedit.png';
import iconsadd from '../Resources/iconsadd.png';
import iconsdelete from '../Resources/iconsdelete.png';
import "../Resources/consultants.css";
import { useUser } from './UserContext';

const ConsultantsPage = () => {
  const { account } = useUser();
  const navigate = useNavigate();

  // Data states
  const [consultants, setConsultants] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [availableDisciplines, setAvailableDisciplines] = useState([]);
  const [consultantDisciplines, setConsultantDisciplines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // View state: if a consultant is selected, show details; otherwise, show table.
  const [selectedConsultant, setSelectedConsultant] = useState(null);

  // Engagement edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingEngagement, setEditingEngagement] = useState(null);
  const [formData, setFormData] = useState({
    ConsultantID: '',
    isEngaged: false,
    engagementDescription: '',
    startDate: '',
    endDate: '',
    contractValue: '',
    remarks: '',
    status: 'Active',
    DisciplineID: ''
  });

  // Loading screen component
  const LoadingScreen = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Spinner animation="border" role="status" style={{ width: '80px', height: '80px' }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <h2 style={{ marginTop: '20px', color: '#1e73be' }}>Loading Data...</h2>
    </div>
  );

  // Fetch all required data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [consultantsRes, engagementsRes, disciplinesRes, consDiscRes] = await Promise.all([
          fetch('http://localhost/consol_pracdb/api.php?entity=consultants&action=read'),
          fetch('http://localhost/consol_pracdb/api.php?entity=engagements&action=read'),
          fetch('http://localhost/consol_pracdb/api.php?entity=disciplines&action=read'),
          fetch('http://localhost/consol_pracdb/api.php?entity=consultant_disciplines&action=read')
        ]);

        if (!consultantsRes.ok) throw new Error('Failed to fetch consultants');
        if (!engagementsRes.ok) throw new Error('Failed to fetch engagements');
        if (!disciplinesRes.ok) throw new Error('Failed to fetch disciplines');
        if (!consDiscRes.ok) throw new Error('Failed to fetch consultant disciplines');

        const consultantsData = await consultantsRes.json();
        const engagementsData = await engagementsRes.json();
        const disciplinesData = await disciplinesRes.json();
        const consDiscData = await consDiscRes.json();

        setConsultants(consultantsData);
        setEngagements(engagementsData);
        setAvailableDisciplines(disciplinesData);
        setConsultantDisciplines(consDiscData);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper: Return consultant name
  const getConsultantName = (consultant) =>
    consultant?.ConsultantName || consultant?.name || 'Unknown';

  // Merge consultant data with discipline names (using the mapping table)
  const mergedConsultants = consultants.map(consultant => {
    const mappings = consultantDisciplines.filter(cd =>
      cd.ConsultantID === consultant.ConsultantID && !cd.deleted_at
    );
    const disciplines = mappings.map(mapping => {
      const disc = availableDisciplines.find(d => d.DisciplineID === mapping.DisciplineID);
      return disc ? disc.DisciplineName : mapping.DisciplineID;
    });
    return { ...consultant, disciplines };
  });

  // Filter consultants by search term (name, email, phone, discipline)
  const filteredConsultants = mergedConsultants.filter(consultant => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (consultant.ConsultantName || '').toLowerCase().includes(term);
    const emailMatch = (consultant.Email || '').toLowerCase().includes(term);
    const phoneMatch = (consultant.phone || '').toLowerCase().includes(term);
    const disciplineMatch = consultant.disciplines &&
      consultant.disciplines.some(d => d.toLowerCase().includes(term));
    return nameMatch || emailMatch || phoneMatch || disciplineMatch;
  });

  // Sorting helper (if needed)
  const requestSort = key => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedConsultants = [...filteredConsultants].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedConsultants = sortedConsultants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Engagement filtering: Only engagements for the selected consultant (if any)
  const filteredEngagements = selectedConsultant
    ? engagements.filter(eng =>
        !eng.deleted_at && eng.ConsultantID === selectedConsultant.ConsultantID
      )
    : [];

  // Engagement modal handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (engagement = null) => {
    if (engagement) {
      setEditingEngagement(engagement);
      setFormData({
        ConsultantID: engagement.ConsultantID,
        isEngaged: !!engagement.isEngaged,
        engagementDescription: engagement.engagementDescription || '',
        startDate: engagement.startDate || '',
        endDate: engagement.endDate || '',
        contractValue: engagement.contractValue || '',
        remarks: engagement.remarks || '',
        status: engagement.status || 'Active',
        DisciplineID: engagement.DisciplineID || ''
      });
    } else {
      setEditingEngagement(null);
      setFormData({
        ConsultantID: selectedConsultant ? selectedConsultant.ConsultantID : '',
        isEngaged: false,
        engagementDescription: '',
        startDate: '',
        endDate: '',
        contractValue: '',
        remarks: '',
        status: 'Active',
        DisciplineID: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEngagement(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = !!editingEngagement;
    const method = isEditing ? 'PUT' : 'POST';
    const payload = {
      ...formData,
      ...(isEditing
        ? {
            EngagementID: editingEngagement.EngagementID,
            updated_by: account?.name,
            updated_at: new Date().toISOString()
          }
        : {
            created_by: account?.name,
            created_at: new Date().toISOString()
          })
    };

    try {
      const response = await fetch('http://localhost/consol_pracdb/api.php?entity=engagements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} engagement.`);
      }
      const refreshedRes = await fetch('http://localhost/consol_pracdb/api.php?entity=engagements&action=read');
      const refreshedData = await refreshedRes.json();
      setEngagements(refreshedData);
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSoftDelete = async (engagementId) => {
    if (!window.confirm('Are you sure you want to delete this engagement?')) return;
    try {
      const response = await fetch('http://localhost/consol_pracdb/api.php?entity=engagements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EngagementID: engagementId,
          deleted_by: account?.name,
          deleted_at: new Date().toISOString()
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete engagement.');
      }
      setEngagements(prev => prev.filter(eng => eng.EngagementID !== engagementId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Render search results (for consultants)
  const renderConsultantSearchResults = () => {
    const matchingConsultants = consultants.filter(c => {
      const name = c.ConsultantName || c.name || '';
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    return (
      <div className="border p-2" style={{ backgroundColor: '#fff' }}>
        {matchingConsultants.length > 0 ? (
          matchingConsultants.map(c => (
            <div
              key={c.ConsultantID || c.id}
              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #ddd' }}
              onClick={() => setSelectedConsultant(c)}
            >
              {c.ConsultantName || c.name}
            </div>
          ))
        ) : (
          <div style={{ padding: '8px' }}>No matching consultant found.</div>
        )}
      </div>
    );
  };

  // Render consultant details view (when a consultant is selected)
  const renderConsultantDetails = () => (
    <>
      <Card className="mb-4">
        <Card.Header as="h5">
          Consultant Information
          <Button variant="link" style={{ float: 'right' }} onClick={() => setSelectedConsultant(null)}>
            Back to Search
          </Button>
        </Card.Header>
        <Card.Body>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Name:</Col>
            <Col xs={8}>{getConsultantName(selectedConsultant)}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Email:</Col>
            <Col xs={8}>{selectedConsultant.Email}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Phone:</Col>
            <Col xs={8}>{selectedConsultant.phone}</Col>
          </Row>
          <Row className="mb-2">
            <Col xs={4} className="fw-bold">Disciplines:</Col>
            <Col xs={8}>
              {getConsultantSpecificDisciplines().map((disc, idx) => (
                <Badge bg="info" key={idx} className="me-1">
                  {disc.DisciplineName}
                </Badge>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {renderEngagementsTable()}
    </>
  );

  // Helper: Get disciplines mapped for selected consultant
  const getConsultantSpecificDisciplines = () => {
    if (!selectedConsultant) return [];
    const mappings = consultantDisciplines.filter(cd =>
      cd.ConsultantID === (selectedConsultant.ConsultantID || selectedConsultant.id) && !cd.deleted_at
    );
    return availableDisciplines.filter(d =>
      mappings.some(m => m.DisciplineID === d.DisciplineID)
    );
  };

  // Render engagements table for the selected consultant
  const renderEngagementsTable = () => {
    return (
      <>
        <Row className="mb-3">
          <Col>
            <h5>Engagements</h5>
          </Col>
          <Col className="text-end">
            <Button style={{ backgroundColor: 'green' }} onClick={() => openModal()}>
              <img src={iconsadd} alt="Add" style={{ width: '20px', height: '20px', marginRight: '5px' }} />
              Add Engagement
            </Button>
          </Col>
        </Row>
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Work Assigned</th>
              <th>Speciality</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Contract Value (Ksh)</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEngagements.map((eng, index) => (
              <tr key={eng.EngagementID}>
                <td>{index + 1}</td>
                <td>{eng.engagementDescription}</td>
                <td>{getDisciplineName(eng.DisciplineID)}</td>
                <td>{eng.startDate}</td>
                <td>{eng.endDate}</td>
                <td>{eng.status}</td>
                <td>{eng.remarks}</td>
                <td>{eng.contractValue}</td>
                <td className="text-end">
                  <Button
                    size="sm"
                    className="me-2"
                    style={{ backgroundColor: '#1e73be', color: '#ffffff' }}
                    onClick={() => openModal(eng)}
                  >
                    <img src={iconsedit} alt="Edit" style={{ width: '20px', height: '20px' }} /> Edit
                  </Button>
                  <Button
                    style={{ backgroundColor: 'red' }}
                    size="sm"
                    onClick={() => handleSoftDelete(eng.EngagementID)}
                  >
                    <img src={iconsdelete} alt="Delete" style={{ width: '20px', height: '20px' }} /> Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  // Render Engagement Edit Modal
  const renderEditEngagementModal = () => (
    <Modal show={showModal} onHide={closeModal} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editingEngagement ? 'Edit Engagement' : 'Add New Engagement'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Work Assigned</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="engagementDescription"
              value={formData.engagementDescription}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Speciality</Form.Label>
            <Form.Select
              name="DisciplineID"
              value={formData.DisciplineID}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Speciality --</option>
              {getConsultantSpecificDisciplines().map(disc => (
                <option key={disc.DisciplineID} value={disc.DisciplineID}>
                  {disc.DisciplineName}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Currently Engaged"
              name="isEngaged"
              checked={formData.isEngaged}
              onChange={handleChange}
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Contract Value (Ksh)</Form.Label>
            <Form.Control
              type="number"
              name="contractValue"
              value={formData.contractValue}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Active">Active/Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={closeModal}>Cancel</Button>
          <Button variant="primary" type="submit" style={{ backgroundColor: '#1e73be' }}>
            {editingEngagement ? 'Save Changes' : 'Create Engagement'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  if (isLoading) return <LoadingScreen />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <>
      <Navbar expand="lg" style={{ backgroundColor: '#1e73be' }} className="py-2">
        <Container fluid>
          <Navbar.Brand className="me-auto" style={{ color: '#ffffff', fontWeight: 'bold' }}>
            Consultant Engagement Management
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/home">
                <img src={iconx} alt="Close" style={{ width: '29px', height: '29px' }} />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid className="px-3 py-4">
        {/* If no consultant is selected, show the search and table */}
        {!selectedConsultant && (
          <>
            <Row className="mb-4">
              <Col md={6} className="mx-auto">
                <InputGroup>
                  <Form.Control
                    placeholder="Search Consultant by Name, Email or Phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <InputGroup.Text>
                    <img src={iconssearch} alt="Search" style={{ width: '20px', height: '20px' }} />
                  </InputGroup.Text>
                </InputGroup>
                {searchTerm && renderConsultantSearchResults()}
              </Col>
            </Row>
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    {['#', 'Name', 'Email', 'Phone', 'Disciplines', 'Engagement Status', 'Start Date', 'End Date', 'Actions']
                      .map(header => (
                        <th key={header} style={{ cursor: header !== 'Actions' ? 'pointer' : 'default' }}
                            onClick={() => header !== 'Actions' && requestSort(header.toLowerCase().replace(/ /g, '_'))}>
                          {header}
                          {sortConfig.key === header.toLowerCase().replace(/ /g, '_') && header !== 'Actions' && (
                            <i className={`bi bi-caret-${sortConfig.direction === 'asc' ? 'up' : 'down'} ms-2`}></i>
                          )}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {mergedConsultants.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center">No active consultants found.</td>
                    </tr>
                  ) : (
                    paginatedConsultants.map((consultant, index) => (
                      <tr key={consultant.ConsultantID} onClick={() => setSelectedConsultant(consultant)} style={{ cursor: 'pointer' }}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{consultant.ConsultantName}</td>
                        <td>{consultant.Email}</td>
                        <td>{consultant.phone}</td>
                        <td>
                          {(consultant.disciplines || []).map((d, idx) => (
                            <Badge bg="secondary" key={idx} className="me-1">{d}</Badge>
                          ))}
                        </td>
                        <td>{consultant.isEngaged ? 'Yes' : 'No'}</td>
                        <td>{consultant.startDate}</td>
                        <td>{consultant.endDate}</td>
                        <td>
                          {/* This icon indicates the row is clickable */}
                          <i className="bi bi-arrow-right-circle" style={{ fontSize: '1.2rem', color: '#1e73be' }}></i>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </>
        )}

        {/* If a consultant is selected, show their detailed info */}
        {selectedConsultant && renderConsultantInfo()}
        
        {error && (
          <Row className="mt-3">
            <Col>
              <Alert variant="danger">{error}</Alert>
            </Col>
          </Row>
        )}
        <div className="mt-4 p-3 bg-light rounded">
          <h5>Statistics</h5>
          <div className="d-flex gap-3">
            <div><strong>Total Consultants:</strong> {mergedConsultants.length}</div>
            <div><strong>Total Active Consultants:</strong> {engagements.filter(e => e.status === 'Active').length}</div>
            <div><strong>Showing:</strong> {filteredConsultants.length} results</div>
          </div>
        </div>
      </Container>

      {/* Engagement Edit Modal */}
      {showEditModal && renderEditEngagementModal()}
    </>
  );
};

export default ConsultantsPage;
