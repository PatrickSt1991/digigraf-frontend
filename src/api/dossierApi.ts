export interface NewDossierRequest {
    funeralCode: string;
    funeralLeader: string;
    voorregeling: boolean;
    funeralType: string;
}

export interface DossierResponse {
    funeralCode: string;
    funeralGuid: string;
    funeralLeader: string;
    voorregeling: boolean;
    funeralType: string;
    newDossierCreated: boolean;
    dossierCompleted: boolean;
}

const API_BASE = "https://localhost:5027/api/dossier"

export async function createNewDossier(request: NewDossierRequest): Promise<DossierResponse> {
    const res = await fetch(`${API_BASE}/new`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    if(!res.ok){
        throw new Error("Failed to create dossier");
    }

    return res.json();
}